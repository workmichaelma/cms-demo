const Core = require(_base + 'app/models/core');
const { isEmpty } = require('lodash');
const mongoose = require('mongoose');
const crypto = require(_base + 'app/helpers/crypto');
const { COLLECTIONS } = require(_base + 'app/config/config');
const {
  checkFieldIsValid,
  withSchemaField,
  withProfileFieldsToDisplay,
} = require('../helpers/common');
const dayjs = require('dayjs');

const collection_name = COLLECTIONS.COMPANY;
const schema = {
  short_name: {
    title: '簡稱',
    type: 'text',
    placeholder: 'short_name： e.g. 偉金 / WCCL',
  },
  name: {
    title: '公司英文名稱',
    type: 'text',
    placeholder: 'name： Company name in English',
    // is_required: true,
    unique_key: true,
  },
  name_tc: {
    title: '公司名稱',
    type: 'text',
    placeholder: 'name_tc： Company name in Chinese',
    is_required: true,
  },
  reg_number: {
    title: '註冊號碼',
    type: 'text',
    placeholder: 'reg_number： eg. CI No.',
    // is_number_only: true,
  },
  contact_number: {
    title: '電話號碼',
    type: 'text',
    placeholder: 'contact_number: for Apply 駕駛許可 form to use',
    is_phone: true,
  },
  address: {
    title: '地址',
    type: 'text',
    placeholder: 'address: for Apply 駕駛許可 form to use',
    is_multiple: false,
  },
  email: {
    title: '電郵',
    type: 'text',
    placeholder: 'email: ',
    is_multiple: true,
    extendable: true,
    is_email: true,
  },
  remarks: {
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
  },
  sign_image: {
    title: '簽名',
    type: 'relation',
    foreign: 'file',
    foreign_label: '_id',
    placeholder: 'sign_image: ',
    default: null,
  },
  chop_image: {
    title: '公司印',
    type: 'relation',
    foreign: 'file',
    foreign_label: '_id',
    placeholder: 'chop_image: ',
    default: null,
  },
  logo_image: {
    title: '公司 Logo',
    type: 'relation',
    foreign: 'file',
    foreign_label: '_id',
    placeholder: 'logo_image: ',
    default: null,
  },
};

const pageConfig = {
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withSchemaField(schema, [
          'short_name',
          'name_tc',
          'reg_number',
          'status',
        ]),
      },
    },
    profile: {
      fieldsToDisplay: ['status', ...withProfileFieldsToDisplay(schema)],
    },
  },
};

let Schema = Core.buildSchema(schema);
Schema = Core.buildCustomInputVirtualFields(Schema, [
  'vehicle_id',
  'vehicle_effective_date',
  'vehicle_end_date',
]);
Schema.plugin(Core.updateLogPlugin);

/* Schema methods */

Schema.statics.getAllVehicles = async ({ _id }) => {
  const __VEHICLE__ = require(_base + 'app/models/vehicle');
  try {
    const query = [
      {
        $match: {
          'companies.company': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $unwind: '$companies',
      },
      {
        $match: {
          'companies.company': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $sort: {
          'companies._id': -1,
        },
      },
      {
        $project: {
          chassis_number: '$chassis_number',
          effective_date: '$companies.effective_date',
          end_date: '$companies.end_date',
          value: '$companies.value',
        },
      },
    ];

    const _doc = await __VEHICLE__.Model.aggregate(query);

    if (_doc) {
      return { _doc };
    } else {
      throw new Error('No Record Found.');
    }
  } catch (err) {
    console.log(`Failed to getAllVehicles, reason: ${err}`);
    return { err };
  }
};

Schema.statics.getAllDrivers = async ({ _id }) => {
  const __DRIVER__ = require(_base + 'app/models/driver');
  try {
    const query = [
      {
        $match: {
          'companies.company': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $addFields: {
          latest: {
            $last: '$companies',
          },
        },
      },
      {
        $match: {
          'latest.company': new mongoose.Types.ObjectId(_id),
        },
      },
    ];

    const _doc = await __DRIVER__.Model.aggregate(query);

    if (_doc) {
      return { _doc };
    } else {
      throw new Error('No Record Found.');
    }
  } catch (err) {
    console.log(`Failed to getAllDrivers, reason: ${err}`);
    return { err };
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
        const { vehicle, effective_date, end_date, ...args } = fields;

        if (isEmpty(error)) {
          update.$set = args;
          const { name_tc } = args;
          const doc = await this.findOneAndUpdate({ name_tc }, update, {
            upsert: true,
            new: true,
          });
          if (doc && doc._id && vehicle) {
            const __VEHICLE__ = require('./vehicle');
            vehicleDoc = await __VEHICLE__.Model.findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(vehicle) },
              {
                $push: {
                  companies: {
                    company: doc._id,
                    effective_date: effective_date || dayjs('2023-1-1'),
                    end_date,
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

console.log({ a: Schema.obj.sign_image });

module.exports = {
  Model,
  schema,
  pageConfig,
};
