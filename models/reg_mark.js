const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const { isEmpty, isString } = require('lodash');
const {
  checkFieldIsValid,
  withSchemaField,
  withVehicleField,
  withProfileFieldsToDisplay,
} = require('../helpers/common');
const { aggregate, handleQuery } = require('./listing');
const dayjs = require('dayjs');

const collection_name = COLLECTIONS.REG_MARK;
const schema = {
  reg_mark: {
    title: '車牌',
    type: 'text',
    is_multiple: false,
    is_required: true,
    editable: false,
  },
  effective_date: {
    title: '生效日期',
    type: 'date',
    is_multiple: false,
  },
  end_date: {
    title: '結束日期',
    type: 'date',
    is_multiple: false,
  },
  company: {
    title: '公司',
    type: 'relation',
    foreign: 'company',
    foreign_label: '_id',
  },
};

const pageConfig = {
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withVehicleField,
        ...withSchemaField(schema, ['reg_mark', 'company', 'status']),
        vehicle_effective_date: '生效日期',
        vehicle_end_date: '結束日期',
      },
    },
    profile: {
      fieldsToDisplay: [
        'status',
        ...withProfileFieldsToDisplay(schema, ['company']),
      ],
    },
  },
};

let Schema = Core.buildSchema(schema);
Schema = Core.updateSubRecordInVehicle(Schema, 'reg_marks', collection_name);
Schema = Core.buildCustomInputVirtualFields(Schema, ['company_id']);
Schema.plugin(Core.updateLogPlugin);

Schema.index({ _id: -1, reg_mark: -1 });

/* Schema methods */
Schema.statics.customQuery = async function (
  req,
  schema,
  fieldsToDisplay,
  props = {}
) {
  const { empty_reg_mark } = props;
  const { filters, queryObject } = handleQuery(req);
  const customFilterFields = [
    'company',
    'chassis_number',
    'print_number',
    'vehicle_effective_date',
    'vehicle_end_date',
  ];
  const searchPipeline = [
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $addFields: {
        company: {
          $first: '$company',
        },
      },
    },
    ...(filters.company
      ? [
          {
            $match: {
              'company.short_name': {
                $regex: filters.company.$regex,
              },
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: 'vehicles',
        let: {
          ref_Id: '$_id',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$current_reg_mark', '$$ref_Id'],
              },
              ...(filters.chassis_number
                ? {
                    chassis_number: {
                      $regex: filters.chassis_number.$regex,
                    },
                  }
                : {}),
              ...(filters.print_number
                ? {
                    print_number: {
                      $regex: filters.print_number.$regex,
                    },
                  }
                : {}),
            },
          },
          {
            $addFields: {
              latest_reg_mark: {
                $last: '$reg_marks',
              },
            },
          },
          ...(filters.vehicle_effective_date || filters.vehicle_end_date
            ? [
                {
                  $match: {
                    ...(filters.vehicle_effective_date
                      ? {
                          'latest_reg_mark.effective_date':
                            filters.vehicle_effective_date.$eq,
                        }
                      : {}),
                  },
                },
              ]
            : []),

          {
            $addFields: {
              isEnded: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $ifNull: ['$latest_reg_mark.end_date', false],
                      },
                      {
                        $eq: ['$latest_reg_mark.end_date', null],
                      },
                    ],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $sort: {
              'latest_reg_mark._id': -1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: 'current_vehicle',
      },
    },
    {
      $addFields: {
        current_vehicle: {
          $ifNull: [{ $first: '$current_vehicle' }, null],
        },
      },
    },
    {
      $addFields: {
        isEndedOrEmpty: {
          $cond: {
            if: {
              $or: [
                {
                  $eq: ['$current_vehicle', null],
                },
                {
                  $eq: ['$current_vehicle.isEnded', true],
                },
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $match: {
        isEndedOrEmpty: !!empty_reg_mark,
      },
    },
  ];
  const projectionPipeline = [
    {
      $addFields: {
        chassis_number: '$current_vehicle.chassis_number',
        print_number: '$current_vehicle.print_number',
        vehicle_end_date: '$current_vehicle.latest_reg_mark.end_date',
        vehicle_effective_date:
          '$current_vehicle.latest_reg_mark.effective_date',
        company: '$company.short_name',
      },
    },
  ];

  const result = await aggregate({
    _this: this,
    customFilterFields,
    fieldsToDisplay,
    searchPipeline,
    projectionPipeline,
    filters,
    queryObject,
  });
  return result;
};

Schema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  await Core.buildUpdate({
    _this: this,
    update,
    fields: [],
    key_name: 'company',
  });
  next();
});

Schema.pre('save', async function (next) {
  try {
    const { input__company_id } = this;
    if (input__company_id && isString(input__company_id)) {
      this.company = input__company_id;
    }
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
});

Schema.statics.getCurrentVehicle = async function ({ _id, reg_mark }) {
  try {
    const match = {};
    if (_id) {
      match._id = _id;
    }
    if (reg_mark) {
      match.reg_mark = reg_mark;
    }
    const pipeline = [
      {
        $match: match,
      },
      {
        $lookup: {
          from: 'vehicles',
          let: {
            ref_Id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$ref_Id', '$reg_marks.reg_mark'],
                },
              },
            },
            {
              $addFields: {
                latest_reg_mark: {
                  $last: '$reg_marks',
                },
              },
            },
            {
              $sort: {
                'latest_reg_mark._id': -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $match: {
                $expr: {
                  $eq: ['$$ref_Id', '$latest_reg_mark.reg_mark'],
                },
              },
            },
            {
              $project: {
                _id: 1,
                chassis_number: '$chassis_number',
                print_number: '$print_number',
                vehicle_effective_date: '$latest_reg_mark.effective_date',
                vehicle_end_date: '$latest_reg_mark.end_date',
                vehicle_object_id: '$latest_reg_mark._id',
              },
            },
          ],
          as: 'vehicle',
        },
      },
      {
        $project: {
          vehicle: {
            $last: '$vehicle',
          },
        },
      },
      {
        $project: {
          _id: '$vehicle.vehicle_object_id',
          vehicle: {
            _id: '$vehicle._id',
            chassis_number: '$vehicle.chassis_number',
          },
          effective_date: '$vehicle.vehicle_effective_date',
          end_date: '$vehicle.vehicle_end_date',
        },
      },
    ];
    const [_doc = null] = (await this.aggregate(pipeline)) || [];
    return _doc;
  } catch (err) {
    console.log(`Failed to getCurrentVehicle, reason: ${err}`);
    return null;
  }
};

Schema.statics.import = async function ({ body }) {
  try {
    const requests = [];
    for (const row of body) {
      try {
        const update = {};
        let vehicleDoc = {};
        const { error, fields } = checkFieldIsValid({ schema, args: row });
        const { vehicle, vehicle_effective_date, vehicle_end_date, ...args } =
          fields;

        if (isEmpty(error)) {
          update.$set = args;
          const { reg_mark } = args;
          const doc = await this.findOneAndUpdate({ reg_mark }, update, {
            upsert: true,
            new: true,
          });
          if (doc && doc._id && vehicle) {
            const __VEHICLE__ = require('./vehicle');
            await __VEHICLE__.Model.findOneAndUpdate(
              {
                current_reg_mark: doc._id,
              },
              {
                $unset: {
                  current_reg_mark: 1,
                },
              }
            );
            vehicleDoc = await __VEHICLE__.Model.findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(vehicle) },
              {
                $set: {
                  current_reg_mark: doc._id,
                },
                $push: {
                  reg_marks: {
                    reg_mark: doc._id,
                    effective_date: vehicle_effective_date || dayjs('2023-1-1'),
                    end_date: vehicle_end_date,
                  },
                },
              }
            );
          }

          requests.push({
            err: false,
            doc: { ...doc, ...vehicleDoc },
          });
        } else {
          requests.push({
            err: true,
            error,
          });
        }
      } catch (err) {
        console.error(`Failed to update/insert data, reason: ${err}`);
        return null;
      }
    }

    const _docs = await Promise.all(requests);

    return {
      _docs,
    };
  } catch (err) {
    console.error(`Failed to import, reason: ${err}`);
    return {
      err,
    };
  }
};

/* Schema methods */
const Model = Core.buildModel({ schema: Schema, collection_name });
schema.status = {
  title: 'Status',
  type: 'boolean',
  is_required: true,
  editable: true,
};

module.exports = {
  Model,
  schema,
  pageConfig,
};
