const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const { isEmpty, isString } = require('lodash');
const { checkFieldIsValid } = require('../helpers/common');
const {
  withVehicleField,
  withSchemaField,
  withProfileFieldsToDisplay,
} = require('../helpers/common');

const collection_name = COLLECTIONS.INSURANCE;
const schema = {
  insurance_company: {
    title: '投保公司',
    type: 'text',
    is_required: true,
    select: true,
    free_solo: true,
    editable: false,
  },
  insurance_kind: {
    title: '保單種類',
    type: 'text',
  },
  policy_number: {
    title: '保單編號',
    type: 'text',
    is_required: true,
    editable: false,
  },
  policy_number2: {
    title: '保單編號 (中港)',
    type: 'text',
  },
  insurance_fee: {
    title: '保費',
    type: 'number',
    show_dollar: true,
  },
  remarks: {
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks:',
  },
  effective_date: {
    title: '承保日期',
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
  title: 'Insurance',
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withVehicleField,
        ...withSchemaField(schema, [
          'insurance_company',
          'insurance_kind',
          'policy_number',
          'insurance_fee',
          'effective_date',
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
Schema = Core.updateSubRecordInVehicle(Schema, 'insurances', collection_name);
Schema.plugin(Core.updateLogPlugin);

Schema = Core.buildCustomInputVirtualFields(Schema, ['contract_id']);

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
        const update = {};
        let vehicleDoc = {};
        const { error, fields } = checkFieldIsValid({ schema, args: row });
        const {
          vehicle,
          vehicle_effective_date,
          vehicle_end_date,
          policy_number,
          ...args
        } = fields;

        if (isEmpty(error)) {
          update.$set = args;
          const doc = await this.findOneAndUpdate({ policy_number }, update, {
            upsert: true,
            new: true,
          });
          if (doc && doc._id && vehicle) {
            const __VEHICLE__ = require('./vehicle');
            vehicleDoc = await __VEHICLE__.Model.findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(vehicle) },
              {
                $push: {
                  insurances: {
                    insurance: doc._id,
                    effective_date: vehicle_effective_date,
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
