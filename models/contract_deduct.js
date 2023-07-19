const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const { isEmpty, isString } = require('lodash');
const {
  checkFieldIsValid,
  withContractField,
  withVehicleImportSchema,
} = require('../helpers/common');
const { withVehicleField } = require('../helpers/common');
const dayjs = require('dayjs');

const collection_name = COLLECTIONS.CONTRACT_DEDUCT;
const schema = {
  contracts: {
    title: 'Contract',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      contract: {
        type: 'relation',
        foreign: 'contract',
        foreign_label: '_id',
        autopopulate: true,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  insurances: {
    title: 'Insurance',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      insurance: {
        type: 'relation',
        foreign: 'insurance',
        foreign_label: '_id',
        autopopulate: true,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  permit_areas: {
    title: 'Permit Area',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      permit_area: {
        type: 'relation',
        foreign: 'permit_area',
        foreign_label: '_id',
        autopopulate: true,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  licenses: {
    title: 'License',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      license: {
        type: 'relation',
        foreign: 'license',
        foreign_label: '_id',
        autopopulate: true,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
};

const pageConfig = {
  title: 'Contract Deduct',
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withVehicleField,
        ...withContractField,
        vehicle_effective_date: '生效日期',
        vehicle_end_date: '結束日期',
      },
    },
    profile: {
      fieldsToDisplay: ['status'],
      relationSeciton: {
        vehicle: {
          readonly: true,
        },
        contract: {
          readonly: true,
          exclude: ['effective_date', 'end_date'],
        },
      },
    },
    import: {
      fieldsToImport: {
        ...withVehicleImportSchema({ exclude: ['vehicle_end_date'] }),
        contract_number: {
          title: '合約編號',
        },
      },
    },
  },
};

let Schema = Core.buildSchema(schema);
Schema = Core.updateSubRecordInVehicle(
  Schema,
  'contract_deducts',
  collection_name
);
Schema = Core.buildCustomInputVirtualFields(Schema, ['contract_id']);
Schema.virtual('current_contract').get(function () {
  if (!isEmpty(this.contracts)) {
    return this.contracts.slice(-1)[0];
  }
  return null;
});

Schema.plugin(Core.updateLogPlugin);
/* Schema methods */

Schema.pre('save', function (next) {
  try {
    const { input__contract_id } = this;
    if (input__contract_id && isString(input__contract_id)) {
      this.contracts = [
        {
          contract: input__contract_id,
        },
      ];
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
        const { vehicle, vehicle_effective_date, contract } = fields;

        if (isEmpty(error)) {
          const doc = await this.create({
            contracts: [{ contract: new mongoose.Types.ObjectId(contract) }],
          });
          if (doc && doc._id && vehicle) {
            const __VEHICLE__ = require('./vehicle');
            vehicleDoc = await __VEHICLE__.Model.findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(vehicle) },
              {
                $push: {
                  contract_deducts: {
                    contract_deduct: doc._id,
                    effective_date: vehicle_effective_date || dayjs('2023-1-1'),
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
