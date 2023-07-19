const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const qs = require('qs');
const { ObjectID } = require('mongodb');
const User = require(_base + 'app/models/user');
const crypto = require(_base + 'app/helpers/crypto');
const {
  compact,
  isArray,
  isEmpty,
  forEach,
  isUndefined,
  reduce,
} = require('lodash');

const isSearchingVehicleField = (field) =>
  field === 'reg_mark' ||
  field === 'print_number' ||
  field === 'chassis_number' ||
  field === 'vehicle_effective_date' ||
  field === 'vehicle_end_date';

const buildSchema = (_schema) => {
  const fields = {};

  for (const [name, field] of Object.entries(_schema)) {
    if (field.type === 'text') {
      fields[name] = {
        type: field.is_multiple ? [String] : String,
        required: field.is_required || false,
        select: field.select || true,
      };
    } else if (field.type === 'textarea') {
      fields[name] = {
        type: field.is_multiple ? [String] : String,
      };
    } else if (field.type === 'upload') {
      fields[name] = {
        type: field.is_multiple ? [String] : String,
      };
    } else if (field.type === 'date') {
      fields[name] = {
        type: field.is_multiple ? [Date] : Date,
        required: field.is_required || false,
      };
    } else if (field.type === 'object') {
      const childFields = buildSchema(field.child);
      fields[name] = {
        type: field.is_multiple ? [childFields] : childFields,
      };
    } else if (field.type === 'relation') {
      fields[name] = {
        type: field.is_multiple
          ? [mongoose.Schema.Types.ObjectId]
          : mongoose.Schema.Types.ObjectId,
        ref: field.foreign,
        required: field.is_required || false,
        autopopulate: field.autopopulate || false,
      };
    } else if (field.type === 'number') {
      fields[name] = {
        type: field.is_multiple ? [String] : String,
        required: field.is_required || false,
      };
    } else if (field.type === 'boolean') {
      fields[name] = {
        type: Boolean,
        required: field.is_required || false,
      };
    } else if (field.type === 'phone') {
      fields[name] = {
        type: field.is_multiple ? [String] : String,
        required: field.is_required || false,
        validate: {
          validator: function (v) {
            return /\d{8}/.test(v);
          },
          message: (props) => `${props.value} is not a valid phone number!`,
        },
      };
    }

    if (!isUndefined(field.default) && !isEmpty(fields[name])) {
      fields[name] = {
        ...fields[name],
        default: field.default,
      };
    }

    if (field.is_multiple) {
      fields[name] = {
        ...fields[name],
        default: field.default || [],
      };
    }
  }

  const Schema = new mongoose.Schema(
    {
      ...fields,
      updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        autopopulate: true,
      },
      created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        autopopulate: true,
      },
      status: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );

  Schema.statics.update = async function (props) {
    try {
      const { _id, body, files, user_id } = props || {};
      const { hkid, password } = body;
      const obj = body;
      if (hkid) {
        obj.hkid = crypto.encrypt(hkid);
      }
      if (password) {
        obj.password = crypto.encrypt(password);
      }
      const update = reduce(
        obj,
        (newUpdate, value, key) => {
          let _value = value;
          if (value === 'null') {
            _value = null;
          }
          newUpdate[key] = _value;
          return newUpdate;
        },
        {}
      );
      const _doc = await this.findOneAndUpdate({ _id }, update, {
        context: { user_id },
      });

      if (_doc) {
        return _doc;
      }
      return {
        err: 'Failed to query entity, something went wrong...',
      };
    } catch (err) {
      console.log(`Faied to update entity, reason: ${err}`);
      return {
        err,
      };
    }
  };

  Schema.statics.query = async function (req, schema, fieldsToDisplay, props) {
    try {
      const { pipeline, page, pageSize } = await handleQuery({
        req,
        schema,
        fieldsToDisplay,
        arr_name: this.collection.name,
        key_name: this.modelName,
        props,
      });
      // return {
      // 	data: {
      // 		metadata: {
      // 			pipeline,
      // 		},
      // 	},
      // };
      const result = await this.aggregate(pipeline);
      if (result) {
        const [{ records, totalCount }] = result || {};

        const count = !isEmpty(records) ? totalCount[0]?.count : 0;

        return {
          data: {
            records,
            metadata: {
              total: count,
              page,
              pageSize,
              hasNextPage: (page - 1) * pageSize + records?.length < count,
              hasPrevPage: page > 1,
              pipeline,
            },
          },
        };
      }
      return {
        err: 'Failed to query entity, something went wrong...',
      };
    } catch (err) {
      return {
        err,
      };
    }
  };

  Schema.statics.insert = async function (props) {
    try {
      const { body, files, user_id } = props || {};
      const { hkid, password } = body;
      const obj = { ...body, created_by: user_id };
      if (hkid) {
        obj.hkid = crypto.encrypt(hkid);
      }
      if (password) {
        obj.password = crypto.encrypt(password);
      }
      const _doc = await this.create(obj);
      if (_doc) {
        return { _doc };
      }
      return {
        err: 'Failed to insert entity, something went wrong...',
      };
    } catch (err) {
      console.error(`Failed to insert, reason: ${err}`);
      return {
        err,
      };
    }
  };

  Schema.statics.distinctColumn = async function ({ column }) {
    try {
      if (column) {
        const result = await this.distinct(column);
        if (result && isArray(result)) {
          return compact(result).map((r) => {
            return {
              _id: r,
              label: r,
            };
          });
        } else {
          throw new Error('No result');
        }
      } else {
        throw new Error('No valid column');
      }
    } catch (err) {
      console.error(`Failed to get distinct column, reason: ${err}`);
      return null;
    }
  };

  Schema.statics.findOneById = async function ({ req, _populate }) {
    try {
      const { _id } = req.params || {};
      if (_id) {
        const { fields, ignoreFields, populate } = req.query;
        const _fields = fields ? fields.split(',').join(' ') : '';
        const _ignoreFields = ignoreFields
          ? ignoreFields
              .split(',')
              .map((v) => `-${v}`)
              .join(' ')
          : '';
        const select = compact([_fields, _ignoreFields]).join(' ');
        const record = await this.findOne({ _id })
          .select(select)
          .populate(populate || _populate)
          .lean({ virtuals: true });
        if (record) {
          return { record };
        } else {
          throw new Error(`<${_id}> not found.`);
        }
      } else {
        throw new Error('No id provided');
      }
    } catch (err) {
      console.log(`Failed to find by ID, reason: ${err}`);
      return {
        err,
      };
    }
  };

  return Schema;
};

const buildCustomInputVirtualFields = (Schema, fields) => {
  forEach(fields, (field) => {
    const name = `input__${field}`;
    Schema.virtual(name)
      .get(function () {
        return this[`_${name}`];
      })
      .set(function (value) {
        this[`_${name}`] = value;
      });
  });
  return Schema;
};

const buildModel = ({ schema, collection_name }) => {
  // schema.plugin(require('mongoose-autopopulate'));
  schema.plugin(mongooseLeanVirtuals);
  const Model = mongoose.model(collection_name, schema);
  return Model;
};

const buildUpdate = async ({
  _this,
  update,
  fields,
  arr_name,
  key_name,
  setCurrentVehicle = false,
}) => {
  if (!arr_name && key_name) {
    if (update[`input__${key_name}_object_id`]) {
      if (update['input__type'] === 'delete') {
      }
    } else if (!isUndefined(update[`input__${key_name}_id`])) {
      const set = reduce(
        fields,
        (acc, field) => {
          acc[field] = update[`input__${key_name}_${field}`] || undefined;
          return acc;
        },
        {
          [key_name]: update[`input__${key_name}_id`]
            ? new mongoose.Types.ObjectId(update[`input__${key_name}_id`])
            : undefined,
        }
      );
      update.$set = {
        ...(update.$set || {}),
        ...set,
      };
    }
  } else {
    if (update[`input__${key_name}_object_id`]) {
      if (update['input__type'] === 'delete') {
        update.$pull = {
          ...(update.$pull || {}),
          [arr_name]: {
            _id: new mongoose.Types.ObjectId(
              update[`input__${key_name}_object_id`]
            ),
          },
        };
        if (setCurrentVehicle) {
          update.$unset = {
            ...update.$unset,
            current_vehicle: 1,
          };
        }
      } else {
        fields.forEach((field) => {
          if (update[`input__${key_name}_${field}`]) {
            update.$set[`${arr_name}.$[item].${field}`] =
              update[`input__${key_name}_${field}`];
          } else if (update[`input__${key_name}_${field}`] === null) {
            update.$unset = {
              ...update.$unset,
              [`${arr_name}.$[item].${field}`]: 1,
            };
          }
        });

        _this.setOptions({
          arrayFilters: [
            {
              [`item._id`]: update[`input__${key_name}_object_id`],
            },
          ],
        });
      }
    } else if (!isUndefined(update[`input__${key_name}_id`])) {
      if (setCurrentVehicle) {
        await _this.model.updateMany(
          { current_vehicle: update['input__vehicle_id'] },
          { $unset: { current_vehicle: 1 } }
        );
        update.$set = {
          ...update.$set,
          current_vehicle: update['input__vehicle_id']
            ? new mongoose.Types.ObjectId(update['input__vehicle_id'])
            : undefined,
        };
      }
      update.$push = {
        ...(update.$push || {}),
      };
      update.$push[arr_name] = reduce(
        fields,
        (acc, field) => {
          acc[field] = update[`input__${key_name}_${field}`] || undefined;
          return acc;
        },
        {
          [key_name]: update[`input__${key_name}_id`]
            ? new mongoose.Types.ObjectId(update[`input__${key_name}_id`])
            : undefined,
        }
      );
    }
  }
  console.log(update, _this.options);
};

const updateSubRecordInVehicle = (Schema, arr_name, key_name) => {
  Schema.pre('findOneAndUpdate', async function (next) {
    try {
      const __VEHICLE__ = require('./vehicle');
      const update = this.getUpdate();

      if (update['input__contract_deduct_id']) {
        const query = this.getQuery();
        const { _id } = query;
        const __CONTRACT_DEDUCT__ = require('./contract_deduct');
        await __CONTRACT_DEDUCT__.Model.findOneAndUpdate(
          {
            _id: update['input__contract_deduct_id'],
          },
          {
            $push: {
              [arr_name]: {
                [key_name]: _id,
              },
            },
          }
        );
      }

      // Update latest subdocument data
      if (update['input__vehicle_object_id']) {
        const set = {};

        if (update['input__vehicle_effective_date']) {
          set[`${arr_name}.$.effective_date`] =
            update['input__vehicle_effective_date'];
        }
        if (update['input__vehicle_end_date']) {
          set[`${arr_name}.$.end_date`] = update['input__vehicle_end_date'];
        }

        console.log(`${arr_name}._id`, update['input__vehicle_object_id'], set);

        await __VEHICLE__.Model.findOneAndUpdate(
          {
            [`${arr_name}._id`]: update['input__vehicle_object_id'],
          },
          { $set: set }
        );
        // Add a new subdocument record
      } else if (
        !isUndefined(
          update['input__vehicle_id'] && !isEmpty(update['input__vehicle_id'])
        )
      ) {
        const { _id } = this.getQuery();
        if (key_name === 'reg_mark') {
          await __VEHICLE__.Model.findOneAndUpdate(
            {
              current_reg_mark: _id,
            },
            {
              $unset: {
                current_reg_mark: 1,
              },
            }
          );
        }
        let set = {};
        if (key_name === 'reg_mark') {
          set.current_reg_mark = _id;
        }
        await __VEHICLE__.Model.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(update['input__vehicle_id']) },
          {
            $set: set,
            $push: {
              [arr_name]: {
                [key_name]: _id,
                effective_date:
                  update['input__vehicle_effective_date'] || undefined,
                end_date: update['input__vehicle_end_date'] || undefined,
              },
            },
          }
        );
      }
      next();
    } catch (err) {
      console.error(err);
    }
  });

  Schema.post('save', async function (doc) {
    if (
      doc._id &&
      this.input__contract_deduct_id &&
      (key_name === 'insurance' ||
        key_name === 'permit_area' ||
        key_name === 'license')
    ) {
      const __CONTRACT_DEDUCT__ = require('./contract_deduct');
      await __CONTRACT_DEDUCT__.Model.findOneAndUpdate(
        {
          _id: this.input__contract_deduct_id,
        },
        {
          $push: {
            [arr_name]: {
              [key_name]: doc._id,
            },
          },
        }
      );
    }
    if (this.input__vehicle_id && doc._id) {
      const __VEHICLE__ = require('./vehicle');
      let set = {};

      if (key_name === 'reg_mark') {
        set.current_reg_mark = doc._id;
      }

      await __VEHICLE__.Model.findOneAndUpdate(
        {
          _id: this.input__vehicle_id,
        },
        {
          $set: set,
          $push: {
            [arr_name]: {
              [key_name]: doc._id,
              effective_date: this.input__vehicle_effective_date,
              end_date: this.input__vehicle_end_date,
            },
          },
        }
      );
    }
  });

  Schema.statics.getAllVehicles = async ({ _id }) => {
    const __VEHICLE__ = require(_base + 'app/models/vehicle');
    try {
      const query = [
        {
          $match: {
            [`${arr_name}.${key_name}`]: new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $unwind: `$${arr_name}`,
        },
        {
          $match: {
            [`${arr_name}.${key_name}`]: new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $sort: {
            [`${arr_name}._id`]: -1,
          },
        },
        {
          $project: {
            chassis_number: '$chassis_number',
            _id: `$${arr_name}._id`,
            [`${key_name}`]: `$${arr_name}.${key_name}`,
            effective_date: `$${arr_name}.effective_date`,
            end_date: `$${arr_name}.end_date`,
            updatedAt: `$${arr_name}.updatedAt`,
            vehicle: {
              _id: '$_id',
              name: '$name',
              chassis_number: '$chassis_number',
            },
          },
        },
        {
          $match: {
            [`${key_name}`]: new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $sort: {
            updatedAt: -1,
            createdAt: -1,
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

  Schema.statics.getCurrentContractDeduct = async ({ _id }) => {
    const __CONTRACT_DEDUCT__ = require('./contract_deduct');
    try {
      const _doc = await __CONTRACT_DEDUCT__.Model.findOne({
        [arr_name]: {
          $elemMatch: {
            [key_name]: _id,
          },
        },
      })
        .populate('contracts.contract')
        .lean();

      if (_doc) {
        const [contract] = _doc?.contracts;
        return {
          _id: _doc._id,
          contract_deduct: {
            _id: contract?.contract?._id,
            contract_number: contract?.contract?.contract_number,
          },
        };
      } else {
        throw new Error('No Record Found.');
      }
    } catch (err) {
      console.log(`Failed to getCurrentContractDeduct, reason: ${err}`);
      return { err };
    }
  };

  Schema = buildCustomInputVirtualFields(Schema, [
    'vehicle_id',
    'vehicle_effective_date',
    'vehicle_end_date',
    'vehicle_object_id',
    'contract_deduct_id',
  ]);
  return Schema;
};

const updateSubRecordInContract = (Schema, arr_name, key_name) => {
  Schema.pre('findOneAndUpdate', async function (next) {
    try {
      const __CONTRACT__ = require('./contract');
      const update = this.getUpdate();

      // Update latest subdocument data
      if (update['input__contract_object_id']) {
        const set = {};

        if (update['input__contract_effective_date']) {
          set[`${arr_name}.$.effective_date`] =
            update['input__contract_effective_date'];
        }
        if (update['input__contract_end_date']) {
          set[`${arr_name}.$.end_date`] = update['input__contract_end_date'];
        }

        await __CONTRACT__.Model.findOneAndUpdate(
          {
            [`${arr_name}._id`]: update['input__contract_object_id'],
          },
          { $set: set }
        );
        // Add a new subdocument record
      } else if (
        !isUndefined(
          update['input__contract_id'] && !isEmpty(update['input__contract_id'])
        )
      ) {
        const { _id } = this.getQuery();
        await __VEHICLE__.Model.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(update['input__contract_id']) },
          {
            $push: {
              [arr_name]: {
                [key_name]: _id,
                effective_date:
                  update['input__contract_effective_date'] || undefined,
                end_date: update['input__contract_end_date'] || undefined,
              },
            },
          }
        );
      }
      next();
    } catch (err) {
      console.error(err);
    }
  });

  Schema.post('save', async function (doc) {
    if (this.input__contract_id && doc._id) {
      const __CONTRACT__ = require('./contract');
      await __CONTRACT__.Model.findOneAndUpdate(
        {
          _id: this.input__contract_id,
        },
        {
          $push: {
            [arr_name]: {
              [key_name]: doc._id,
              effective_date: this.input__contract_effective_date,
              end_date: this.input__contract_end_date,
            },
          },
        }
      );
    }
  });

  Schema.statics.getAllContracts = async ({ _id }) => {
    const __CONTRACT__ = require(_base + 'app/models/contract');
    try {
      const query = [
        {
          $match: {
            [`${arr_name}.${key_name}`]: new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $unwind: `$${arr_name}`,
        },
        {
          $project: {
            _id: `$${arr_name}._id`,
            [`${key_name}`]: `$${arr_name}.${key_name}`,
            effective_date: `$${arr_name}.effective_date`,
            end_date: `$${arr_name}.end_date`,
            updatedAt: `$${arr_name}.updatedAt`,
            contract: {
              _id: '$_id',
              contract_number: '$contract_number',
            },
          },
        },
        {
          $match: {
            [`${key_name}`]: new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $sort: {
            updatedAt: -1,
            createdAt: -1,
          },
        },
      ];
      const _doc = await __CONTRACT__.Model.aggregate(query);

      if (_doc) {
        return { _doc };
      } else {
        throw new Error('No Record Found.');
      }
    } catch (err) {
      console.log(`Failed to getAllContracts, reason: ${err}`);
      return { err };
    }
  };

  Schema = buildCustomInputVirtualFields(Schema, [
    'contract_id',
    'contract_effective_date',
    'contract_end_date',
    'contract_object_id',
  ]);
  return Schema;
};

const updateLogPlugin = (schema, options) => {
  schema.post('save', async function (doc) {
    try {
      const Log = require('./log');
      Log.log({
        data: JSON.stringify(doc),
        doc_id: doc._id,
        collection_name: doc.constructor.collection.name,
        created_by: doc.created_by,
        action: 'CREATE',
      });
    } catch (err) {
      console.log(`Failed to add create LOG, reason: ${err}`);
    }
  });
  schema.pre('findOneAndUpdate', function (next) {
    try {
      const { user_id = undefined } = this.options.context || {};
      const update = this.getUpdate();
      update.updated_by = user_id || undefined;
      update.updated_at = new Date();
    } catch (err) {
      console.log(`Failed to add updateBy, reason: ${err}`);
    }
    next();
  });

  schema.post('findOneAndUpdate', async function (old_data) {
    try {
      const Log = require('./log');
      const data = await this.model.findOne({ _id: old_data._id }).lean();
      const difference = this._update?.$set || this._update;

      delete difference.updatedAt;
      delete difference.updated_by;
      Log.log({
        doc_id: old_data._id,
        old_data: JSON.stringify(old_data),
        data: JSON.stringify(data),
        difference,
        collection_name: this.model.collection.name,
        created_by: this.options?.context?.user_id,
        action: 'UPDATE',
      });
    } catch (err) {
      console.log(`Failed to add update LOG, reason: ${err}`);
    }
  });
};

const linkToVehiclePipeline = (schema, arr_name, key_name) => {
  if (key_name === 'reg_mark') {
    return [
      {
        $addFields: {
          chassis_number: '$current_vehicle.chassis_number',
          print_number: '$current_vehicle.print_number',
          vehicle_effective_date:
            '$current_vehicle.latest_reg_mark.effective_date',
          vehicle_end_date: '$current_vehicle.latest_reg_mark.end_date',
        },
      },
    ];
  }
  if (key_name === 'license' || key_name === 'insurance') {
    return [
      {
        $lookup: {
          from: 'vehicles',
          let: {
            ref_Id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ['$$ref_Id', `$${arr_name}.${key_name}`],
                    },
                  },
                ],
              },
            },
          ],
          as: 'vehicle',
        },
      },
      {
        $lookup: {
          from: 'reg_marks',
          localField: 'reg_mark',
          foreignField: '_id',
          as: 'reg_mark',
        },
      },
      {
        $addFields: {
          reg_mark: {
            $first: '$reg_mark.reg_mark',
          },
          chassis_number: {
            $first: '$vehicle.chassis_number',
          },
          print_number: {
            $first: '$vehicle.print_number',
          },
        },
      },
    ];
  }
  if (schema?.vehicles) {
    return [
      {
        $addFields: {
          latest_vehicle: {
            $last: '$vehicles',
          },
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          let: {
            vehicle_effective_date: '$latest_vehicle.effective_date',
            vehicle_end_date: '$latest_vehicle.end_date',
            ref_Id: '$current_vehicle',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$ref_Id', '$_id'],
                },
              },
            },
            {
              $lookup: {
                from: 'reg_marks',
                localField: 'current_reg_mark',
                foreignField: '_id',
                as: 'reg_mark',
              },
            },
            {
              $addFields: {
                vehicle_effective_date: '$$vehicle_effective_date',
                vehicle_end_date: '$$vehicle_end_date',
                reg_mark: {
                  $first: '$reg_mark.reg_mark',
                },
              },
            },
          ],
          as: 'current_vehicle',
        },
      },
      {
        $addFields: {
          current_vehicle: {
            $first: '$current_vehicle',
          },
        },
      },
      {
        $addFields: {
          reg_mark: '$current_vehicle.reg_mark',
          chassis_number: '$current_vehicle.chassis_number',
          print_number: '$current_vehicle.print_number',
          vehicle_effective_date: '$current_vehicle.vehicle_effective_date',
          vehicle_end_date: '$current_vehicle.vehicle_end_date',
        },
      },
    ];
  } else {
    return [
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
                  $in: ['$$ref_Id', `$${arr_name}.${key_name}`],
                },
              },
            },
            {
              $addFields: {
                [key_name]: {
                  $filter: {
                    input: `$${arr_name}`,
                    as: arr_name,
                    cond: {
                      $eq: [`$$${arr_name}.${key_name}`, '$$ref_Id'],
                    },
                  },
                },
              },
            },
            {
              $lookup: {
                from: 'reg_marks',
                localField: 'current_reg_mark',
                foreignField: '_id',
                as: 'reg_mark',
              },
            },
            {
              $project: {
                _id: 0,
                chassis_number: '$chassis_number',
                print_number: '$print_number',
                reg_mark: {
                  $first: '$reg_mark.reg_mark',
                },
                vehicle_effective_date: {
                  $first: `$${key_name}.effective_date`,
                },
                vehicle_end_date: {
                  $first: `$${key_name}.end_date`,
                },
              },
            },
          ],
          as: 'vehicle',
        },
      },
      {
        $addFields: {
          chassis_number: {
            $first: '$vehicle.chassis_number',
          },
          print_number: {
            $first: '$vehicle.print_number',
          },
          reg_mark: {
            $first: '$vehicle.reg_mark',
          },
          vehicle_effective_date: {
            $first: '$vehicle.vehicle_effective_date',
          },
          vehicle_end_date: {
            $first: '$vehicle.vehicle_end_date',
          },
        },
      },
    ];
  }
};

const linkToContractPipeline = (schema, arr_name, key_name) => {
  if (schema?.contracts) {
    return [
      {
        $addFields: {
          _contract: {
            $last: '$contracts',
          },
        },
      },
      {
        $lookup: {
          from: 'contracts',
          localField: '_contract.contract',
          foreignField: '_id',
          as: '_contract',
        },
      },
      {
        $addFields: {
          contract_number: {
            $first: '$_contract.contract_number',
          },
        },
      },
    ];
  } else {
    return [
      {
        $lookup: {
          from: 'contracts',
          let: {
            ref_Id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$ref_Id', `$${arr_name}.${key_name}`],
                },
              },
            },
            {
              $unwind: `$${arr_name}`,
            },
            { $sort: { [`${arr_name}._id`]: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                contract_number: '$contract_number',
                contract_effective_date: `$${arr_name}.effective_date`,
                contract_end_date: `$${arr_name}.end_date`,
              },
            },
          ],
          as: 'contract',
        },
      },
      {
        $unwind: '$contract',
      },
      {
        $addFields: {
          contract_number: '$contract.contract_number',
          contract_effective_date: '$contract.contract_effective_date',
          contract_end_date: '$contract.contract_end_date',
        },
      },
    ];
  }
};

const getCompanyPipeline = (schema) => {
  if (schema.company) {
    return [
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
      {
        $addFields: {
          company: '$company.short_name',
        },
      },
    ];
  }
  return [];
};

const getContractPipeline = (schema) => {
  if (schema.contract) {
    return [
      {
        $lookup: {
          from: 'contracts',
          localField: 'contract',
          foreignField: '_id',
          as: 'contract',
        },
      },
      {
        $addFields: {
          contract: {
            $first: '$contract',
          },
        },
      },
      {
        $addFields: {
          contract_number: '$contract.contract_number',
        },
      },
    ];
  }
  return [];
};

const getDriverPermitPipeline = () => {
  return [
    {
      $lookup: {
        from: 'drivers',
        localField: 'driver',
        foreignField: '_id',
        as: 'driver',
      },
    },
    {
      $addFields: {
        driver: {
          $last: '$driver',
        },
      },
    },
    {
      $addFields: {
        driver: '$driver.name',
      },
    },
  ];
};

const getVehicleRegMarkPipeline = () => {
  return [
    {
      $lookup: {
        from: 'reg_marks',
        localField: 'current_reg_mark',
        foreignField: '_id',
        as: 'current_reg_mark',
      },
    },
    {
      $addFields: {
        current_reg_mark: '$current_reg_mark.reg_mark',
      },
    },
  ];
};

const getDriverFilters = ({ driverFilters, schema, arr_name, key_name }) => {
  const hasDriver = !!driverFilters['driver'];
  const hasHKID = !!driverFilters['hkid'];
  if (key_name === 'driver') {
    return [
      ...(hasHKID
        ? [
            {
              $addFields: {
                search__hkid: {
                  $substr: [{ $toString: '$hkid' }, 0, 4],
                },
              },
            },
            {
              $match: {
                search__hkid: {
                  $regex: driverFilters.hkid.parsedValue,
                },
              },
            },
          ]
        : []),
    ];
  }
  return [
    {
      $lookup: {
        from: 'drivers',
        localField: 'driver',
        foreignField: '_id',
        as: 'search__driver',
      },
    },
    {
      $unwind: '$search__driver',
    },
    {
      $match: {
        ...(hasDriver
          ? {
              'search__driver.name': {
                $regex: driverFilters.driver.parsedValue,
              },
            }
          : {}),
      },
    },
  ];
};

const getCompanyFilters = ({ companyFilters, schema, arr_name, key_name }) => {
  const hasCompany = !!companyFilters['company'];
  return [
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'search__company',
      },
    },
    {
      $unwind: '$search__company',
    },
    {
      $match: {
        ...(hasCompany
          ? {
              'search__company.short_name': {
                $regex: companyFilters.company.parsedValue,
              },
            }
          : {}),
      },
    },
  ];
};

const getContractFilters = ({
  contractFilters,
  schema,
  arr_name,
  key_name,
}) => {
  const hasContractNumber = !!contractFilters['contract_number'];
  if (key_name === 'contract') {
    return [
      {
        $match: {
          contract_number: {
            $regex: contractFilters.contract_number.parsedValue,
          },
        },
      },
    ];
  }
  if (schema.contract) {
    return [
      {
        $lookup: {
          from: 'contracts',
          let: {
            ref_Id: '$contract',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$ref_Id'],
                },
                ...(hasContractNumber
                  ? {
                      contract_number: {
                        $regex: contractFilters.contract_number.parsedValue,
                      },
                    }
                  : {}),
              },
            },
          ],
          as: 'search__contract',
        },
      },
      {
        $unwind: '$search__contract',
      },
    ];
  }
  return [
    {
      $addFields: {
        latest_contract: {
          $last: '$contracts',
        },
      },
    },
    {
      $lookup: {
        from: 'contracts',
        let: {
          ref_Id: '$latest_contract.contract',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$ref_Id'],
              },
              ...(hasContractNumber
                ? {
                    contract_number: {
                      $regex: contractFilters.contract_number.parsedValue,
                    },
                  }
                : {}),
            },
          },
        ],
        as: 'current_contract',
      },
    },
    {
      $unwind: '$current_contract',
    },
  ];
};

const getVehicleFilters = ({
  vehicleFilters,
  schema,
  arr_name,
  key_name,
  empty_reg_mark,
}) => {
  const hasRegMark = !!vehicleFilters['reg_mark'];
  const hasChassisNumber = !!vehicleFilters['chassis_number'];
  const hasPrintNumber = !!vehicleFilters['print_number'];
  const hasEffectiveDate = !!vehicleFilters['vehicle_effective_date'];
  const hasEndDate = !!vehicleFilters['vehicle_end_date'];
  if (key_name === 'vehicle') {
    return [
      {
        $lookup: {
          from: 'reg_marks',
          localField: 'current_reg_mark',
          foreignField: '_id',
          as: 'search_current_reg_mark',
        },
      },
      {
        $unwind: '$search_current_reg_mark',
      },
      {
        $match: {
          'search_current_reg_mark.reg_mark': {
            $regex: vehicleFilters.current_reg_mark.parsedValue,
          },
        },
      },
    ];
  }
  if (key_name === 'reg_mark') {
    return [
      ...(hasRegMark
        ? [
            {
              $match: {
                reg_mark: {
                  $regex: vehicleFilters.reg_mark.parsedValue,
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
              $match: {
                ...(hasChassisNumber
                  ? {
                      chassis_number: vehicleFilters.chassis_number.parsedValue,
                    }
                  : {}),
                ...(!empty_reg_mark
                  ? {
                      $and: [
                        { chassis_number: { $exists: true } },
                        { 'latest_reg_mark.end_date': { $exists: false } },
                      ],
                    }
                  : {
                      $or: [
                        { chassis_number: { $exists: false } },
                        { 'latest_reg_mark.end_date': { $exists: true } },
                      ],
                    }),
              },
            },
          ],
          as: 'current_vehicle',
        },
      },
      {
        $unwind: '$current_vehicle',
      },
    ];
  }
  if (key_name === 'license' || key_name === 'insurance') {
    return [
      ...(hasRegMark
        ? [
            {
              $lookup: {
                from: 'reg_marks',
                localField: 'reg_mark',
                foreignField: '_id',
                as: 'search_reg_mark',
              },
            },
            {
              $unwind: '$search_reg_mark',
            },
            {
              $match: {
                'search_reg_mark.reg_mark': {
                  $regex: vehicleFilters.reg_mark.parsedValue,
                },
              },
            },
          ]
        : []),
      ...(hasChassisNumber || hasPrintNumber
        ? [
            {
              $lookup: {
                from: 'vehicles',
                let: {
                  ref_Id: '$_id',
                },
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          $expr: {
                            $in: ['$$ref_Id', `$${arr_name}.${key_name}`],
                          },
                        },
                        ...(hasChassisNumber
                          ? [
                              {
                                chassis_number: {
                                  $regex:
                                    vehicleFilters.chassis_number.parsedValue,
                                },
                              },
                            ]
                          : []),
                        ...(hasPrintNumber
                          ? [
                              {
                                print_number: {
                                  $regex:
                                    vehicleFilters.print_number.parsedValue,
                                },
                              },
                            ]
                          : []),
                      ],
                    },
                  },
                ],
                as: 'search_vehicle',
              },
            },
            {
              $unwind: '$search_vehicle',
            },
          ]
        : []),
    ];
  }
  if (schema.vehicles) {
    return [
      ...(hasRegMark
        ? [
            {
              $lookup: {
                from: 'reg_marks',
                pipeline: [
                  {
                    $match: {
                      reg_mark: {
                        $regex: vehicleFilters.reg_mark.parsedValue,
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                    },
                  },
                ],
                as: 'reg_marks_to_search',
              },
            },
            {
              $addFields: {
                reg_marks_to_search: {
                  $map: {
                    input: '$reg_marks_to_search',
                    as: 'reg_mark',
                    in: '$$reg_mark._id',
                  },
                },
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: 'vehicles',
          localField: 'current_vehicle',
          foreignField: '_id',
          as: 'current_vehicle',
        },
      },
      {
        $addFields: {
          current_vehicle: {
            $first: '$current_vehicle',
          },
        },
      },
      ...(hasEffectiveDate || hasEndDate
        ? [
            {
              $addFields: {
                latest_vehicle: {
                  $last: '$vehicles',
                },
              },
            },
          ]
        : []),
      {
        $match: {
          $and: [
            ...(hasRegMark
              ? [
                  {
                    $expr: {
                      $in: [
                        '$current_vehicle.current_reg_mark',
                        '$reg_marks_to_search',
                      ],
                    },
                  },
                ]
              : []),
            ...(hasChassisNumber
              ? [
                  {
                    'current_vehicle.chassis_number':
                      vehicleFilters.chassis_number.parsedValue,
                  },
                ]
              : []),
            ...(hasPrintNumber
              ? [
                  {
                    'current_vehicle.print_number':
                      vehicleFilters.print_number.parsedValue,
                  },
                ]
              : []),
            ...(hasEffectiveDate
              ? [
                  {
                    'latest_vehicle.effective_date':
                      vehicleFilters.vehicle_effective_date.parsedValue,
                  },
                ]
              : []),
            ...(hasEndDate
              ? [
                  {
                    'latest_vehicle.end_date':
                      vehicleFilters.vehicle_end_date.parsedValue,
                  },
                ]
              : []),
          ],
        },
      },
      {
        $addFields: {
          current_vehicle: '$current_vehicle._id',
        },
      },
    ];
  } else {
    return [
      ...(hasRegMark
        ? [
            {
              $lookup: {
                from: 'reg_marks',
                pipeline: [
                  {
                    $match: {
                      reg_mark: {
                        $regex: vehicleFilters.reg_mark.parsedValue,
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                    },
                  },
                ],
                as: 'reg_marks_to_search',
              },
            },
            {
              $addFields: {
                reg_marks_to_search: {
                  $map: {
                    input: '$reg_marks_to_search',
                    as: 'reg_mark',
                    in: '$$reg_mark._id',
                  },
                },
              },
            },
            {
              $addFields: {
                reg_marks_to_search: {
                  $map: {
                    input: ['$reg_marks_to_search'],
                    as: 'reg_marks',
                    in: '$$reg_marks',
                  },
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
            ...(hasRegMark
              ? {
                  reg_marks_to_search: {
                    $first: '$reg_marks_to_search',
                  },
                }
              : {}),
          },
          pipeline: [
            ...(hasEffectiveDate || hasEndDate
              ? [
                  {
                    $addFields: {
                      [key_name]: {
                        $first: {
                          $filter: {
                            input: `$${arr_name}`,
                            as: arr_name,
                            cond: {
                              $eq: [`$$${arr_name}.${key_name}`, '$$ref_Id'],
                            },
                          },
                        },
                      },
                    },
                  },
                ]
              : []),
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $in: ['$$ref_Id', `$${arr_name}.${key_name}`],
                    },
                  },
                  ...(hasRegMark
                    ? [
                        {
                          $expr: {
                            $in: ['$current_reg_mark', '$$reg_marks_to_search'],
                          },
                        },
                      ]
                    : []),
                  ...(hasChassisNumber
                    ? [
                        {
                          chassis_number:
                            vehicleFilters.chassis_number.parsedValue,
                        },
                      ]
                    : []),
                  ...(hasPrintNumber
                    ? [
                        {
                          print_number: vehicleFilters.print_number.parsedValue,
                        },
                      ]
                    : []),
                  ...(hasEffectiveDate
                    ? [
                        {
                          $expr: {
                            $eq: [
                              `$${key_name}.effective_date`,
                              vehicleFilters.vehicle_effective_date.parsedValue,
                            ],
                          },
                        },
                      ]
                    : []),
                  ...(hasEndDate
                    ? [
                        {
                          $expr: {
                            $eq: [
                              `$${key_name}.end_date`,
                              vehicleFilters.vehicle_end_date.parsedValue,
                            ],
                          },
                        },
                      ]
                    : []),
                ],
              },
            },
          ],
          as: 'vehicles_to_search',
        },
      },
      {
        $unwind: '$vehicles_to_search',
      },
    ];
  }
};

const handleQuery = ({
  req,
  schema,
  fieldsToDisplay = [],
  arr_name,
  key_name,
  props,
}) => {
  const {
    empty_reg_mark = false,
    valid_license = false,
    valid_insurance = false,
  } = props || {};
  const queryObject = qs.parse(req.query);
  const pipeline = [];

  let page = 1;
  let skip = 0;
  let limit = 50;
  let filters = [];
  let driverFilters = {};
  let companyFilters = {};
  let contractFilters = {};
  let vehicleFilters = {};

  if (!isEmpty(req.query)) {
    if (queryObject.filters) {
      queryObject.filters.split(',').forEach((filter) => {
        const [field, value] = filter.split('^');
        const operator = value.startsWith('=')
          ? '$eq'
          : value.startsWith('>')
          ? '$gt'
          : value.startsWith('>=')
          ? '$gte'
          : value.startsWith('<')
          ? '$lt'
          : value.startsWith('<=')
          ? '$lte'
          : value.startsWith('~=')
          ? '$regex'
          : '$eq';
        const _parsedValue =
          value.startsWith('>=') ||
          value.startsWith('<=') ||
          value.startsWith('~=')
            ? value.slice(2)
            : value.startsWith('=') ||
              value.startsWith('<') ||
              value.startsWith('>')
            ? value.slice(1)
            : value;
        const parsedValue = field.endsWith('_id')
          ? new mongoose.Types.ObjectId(_parsedValue)
          : field.endsWith('_date') || field === 'dob'
          ? new Date(_parsedValue)
          : _parsedValue === 'true'
          ? true
          : _parsedValue === 'false'
          ? false
          : operator === '$regex'
          ? new RegExp(_parsedValue, 'i')
          : _parsedValue;

        if (
          ((key_name === 'vehicle' && field === 'current_reg_mark') ||
            isSearchingVehicleField(field)) &&
          !(
            key_name === 'vehicle' &&
            (field === 'chassis_number' || field === 'print_number')
          )
        ) {
          vehicleFilters[field] = {
            operator,
            parsedValue,
          };
        } else if (field === 'contract_number') {
          contractFilters[field] = {
            operator,
            parsedValue,
          };
        } else if (field === 'company') {
          companyFilters[field] = {
            operator,
            parsedValue,
          };
        } else if (field === 'driver' || field === 'hkid') {
          driverFilters[field] = {
            operator,
            parsedValue,
          };
        } else {
          filters.push({ [field]: { [operator]: parsedValue } });
        }
      });
    }
    if (filters.length > 0) {
      pipeline.push({ $match: { $and: filters } });
    }
    console.log({ key_name });
    if (!isEmpty(vehicleFilters) || key_name === 'reg_mark') {
      pipeline.push(
        ...getVehicleFilters({
          vehicleFilters,
          schema,
          arr_name,
          key_name,
          empty_reg_mark,
        })
      );
    }
    if (!isEmpty(contractFilters)) {
      pipeline.push(
        ...getContractFilters({ contractFilters, schema, arr_name, key_name })
      );
    }
    if (!isEmpty(companyFilters)) {
      pipeline.push(
        ...getCompanyFilters({ companyFilters, schema, arr_name, key_name })
      );
    }
    if (!isEmpty(driverFilters) || key_name === 'driver') {
      pipeline.push(
        ...getDriverFilters({ driverFilters, schema, arr_name, key_name })
      );
    }
    if (valid_license || valid_insurance) {
      pipeline.push({
        $match: {
          $or: [
            {
              end_date: {
                $exists: false,
              },
            },
            {
              end_date: {
                $in: [null, undefined],
              },
            },
            {
              end_date: {
                $gte: new Date(),
              },
            },
          ],
        },
      });
    }
    page = parseInt(queryObject.page) || 1;
    const pageSize = parseInt(queryObject.pagesize) || 50;
    skip = (page - 1) * pageSize;
    limit = pageSize;

    const projectionPipeline = [];
    if (key_name === 'vehicle') {
      projectionPipeline.push(...getVehicleRegMarkPipeline());
    } else if (key_name === 'driver_permit') {
      projectionPipeline.push(...getDriverPermitPipeline());
    } else if (
      fieldsToDisplay.includes('chassis_number') ||
      fieldsToDisplay.includes('reg_mark') ||
      fieldsToDisplay.includes('print_number')
    ) {
      projectionPipeline.push(
        ...linkToVehiclePipeline(schema, arr_name, key_name)
      );
    }

    if (fieldsToDisplay.includes('contract_number')) {
      projectionPipeline.push(...getContractPipeline(schema));
    }

    if (fieldsToDisplay.includes('company')) {
      projectionPipeline.push(...getCompanyPipeline(schema));
    }

    if (key_name === 'contract_deduct') {
      projectionPipeline.push(
        ...linkToContractPipeline(schema, arr_name, key_name)
      );
    }
    if (key_name === 'driver') {
      projectionPipeline.push({
        $addFields: {
          hkid: {
            $substr: [{ $toString: '$hkid' }, 0, 4],
          },
        },
      });
    }
    const projection = fieldsToDisplay.reduce((fields, field) => {
      fields[field] = `$${field}`;
      return fields;
    }, {});

    projectionPipeline.push({
      $project: projection,
    });

    if (queryObject.sort) {
      const sortFieldMatch = queryObject.sort.split('=');
      if (sortFieldMatch.length === 2) {
        const [first, second] = sortFieldMatch[1].split('-');
        const order = second ? -1 : 1;
        pipeline.push({
          $facet: {
            records: [
              ...projectionPipeline,
              { $sort: { [second || first]: order } },
              { $skip: skip },
              { $limit: limit },
            ],
            totalCount: [{ $count: 'count' }],
          },
        });
      }
    } else {
      pipeline.push({
        $facet: {
          records: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $skip: skip },
            { $limit: limit },
            ...projectionPipeline,
          ],
          totalCount: [{ $count: 'count' }],
        },
      });
    }
  }
  return {
    pipeline,
    page,
    pageSize: limit,
  };
};

module.exports = {
  buildSchema,
  buildCustomInputVirtualFields,
  buildModel,
  buildUpdate,
  updateLogPlugin,
  updateSubRecordInVehicle,
  updateSubRecordInContract,
};
