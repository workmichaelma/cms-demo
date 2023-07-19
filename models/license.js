const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const { isEmpty, isString } = require('lodash');
const {
  checkFieldIsValid,
  withVehicleField,
  withSchemaField,
  withProfileFieldsToDisplay,
} = require('../helpers/common');

const collection_name = COLLECTIONS.LICENSE;
const schema = {
  license_fee: {
    title: '牌費',
    type: 'number',
    is_number_only: true,
    is_positive: true,
    is_required: true,
    show_dollar: true,
  },
  special_permit: {
    title: '特別許可證',
    type: 'text',
    // is_required: true,
  },
  permit_fee: {
    title: '特別許可費',
    type: 'number',
    is_number_only: true,
    is_positive: true,
    show_dollar: true,
  },
  remarks: {
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
  },
  effective_date: {
    title: '續牌日期',
    type: 'date',
    is_multiple: false,
  },
  end_date: {
    title: '結束日期',
    type: 'date',
    is_multiple: false,
  },
  contract: {
    type: 'relation',
    foreign: 'contract',
    foreign_label: '_id',
  },
  reg_mark: {
    title: '車牌',
    type: 'relation',
    foreign: 'reg_mark',
    foreign_label: '_id',
  },
};

const pageConfig = {
  title: 'License',
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withVehicleField,
        ...withSchemaField(schema, [
          'license_fee',
          'special_permit',
          'end_date',
        ]),
        contract_number: '合約編號',
      },
    },
    profile: {
      fieldsToDisplay: ['status', ...withProfileFieldsToDisplay(schema)],
    },
  },
};

let Schema = Core.buildSchema(schema);
Schema = Core.updateSubRecordInVehicle(Schema, 'licenses', collection_name);
Schema.plugin(Core.updateLogPlugin);

Schema = Core.buildCustomInputVirtualFields(Schema, [
  'contract_id',
  'reg_mark_id',
]);

/* Schema methods */
Schema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  await Core.buildUpdate({
    _this: this,
    update,
    fields: [],
    key_name: 'contract',
  });
  await Core.buildUpdate({
    _this: this,
    update,
    fields: [],
    key_name: 'reg_mark',
  });
  next();
});

Schema.pre('save', async function (next) {
  try {
    const { input__contract_id } = this;
    if (input__contract_id && isString(input__contract_id)) {
      this.contract = input__contract_id;
    }
    const { input__reg_mark_id } = this;
    if (input__reg_mark_id && isString(input__reg_mark_id)) {
      this.reg_mark = input__reg_mark_id;
    }
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
});
Schema.statics.import = async function ({ body }) {
  try {
    const requests = [];
    for (const row of body) {
      try {
        const { error, fields } = checkFieldIsValid({ schema, args: row });
        const { vehicle, vehicle_effecitve_date, vehicle_end_date, ...args } =
          fields;

        if (!isEmpty(error)) {
          requests.push({
            err: true,
            error,
          });
        } else {
          if (vehicle) {
            const { _doc } = await this.insert({
              body: args,
            });

            if (_doc && _doc?._id) {
              const __VEHICLE__ = require('./vehicle');
              const vehicleDoc = await __VEHICLE__.Model.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(vehicle) },
                {
                  $push: {
                    licenses: {
                      license: _doc._id,
                      effective_date: vehicle_effecitve_date,
                      end_date: vehicle_end_date,
                    },
                  },
                }
              );
              requests.push({ err: false, doc: { ...vehicleDoc, ..._doc } });
            }
          }
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
