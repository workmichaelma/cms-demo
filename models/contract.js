const Core = require(_base + 'app/models/core');
const { isEmpty } = require('lodash');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const {
  checkFieldIsValid,
  withVehicleField,
  withSchemaField,
  withProfileFieldsToDisplay,
} = require('../helpers/common');
const dayjs = require('dayjs');

const collection_name = COLLECTIONS.CONTRACT;
const schema = {
  contract_number: {
    title: '合約編號',
    type: 'text',
    placeholder: 'contract_number: eg. 05/HY/2018',
    is_required: true,
    editable: false,
    unique_key: true,
  },
  short_name: {
    title: '合約概要',
    type: 'text',
    placeholder: 'short_name: eg. 大埔及北區',
  },
  title: {
    title: '合約英文名稱',
    type: 'text',
    placeholder:
      'title: eg. Highways Department Term Contract (Management and Maintenance of Roads in Tai Po and North Districts ...',
  },
  title_tc: {
    title: '合約名稱',
    type: 'text',
    placeholder: 'title_tc: eg. 路政署定期合約（大埔及北區道路 ...',
  },
  remarks: {
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
  },
  effective_date: {
    title: '合約生效日期',
    type: 'date',
  },
  end_date: {
    title: '合約結束日期',
    type: 'date',
  },
  contract_deducts: {
    title: 'Contract Deduct',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      contract_deduct: {
        type: 'relation',
        foreign: 'contract_deduct',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Start Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
};

const pageConfig = {
  pages: {
    listing: {
      fieldsToDisplay: {
        // ...withVehicleField,
        ...withSchemaField(schema, [
          'contract_number',
          'short_name',
          'effective_date',
          'end_date',
          'status',
        ]),
        // vehicle_effective_date: 'Effective Date',
        // vehicle_end_date: 'End Date',
      },
    },
    profile: {
      fieldsToDisplay: ['status', ...withProfileFieldsToDisplay(schema)],
    },
  },
};

let Schema = Core.buildSchema(schema);
Schema = Core.updateSubRecordInVehicle(Schema, 'contracts', collection_name);
Schema.plugin(Core.updateLogPlugin);

Schema.index({ _id: 1 });

/* Schema methods */
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
          const { contract_number } = args;
          const doc = await this.findOneAndUpdate({ contract_number }, update, {
            upsert: true,
            new: true,
          });
          if (doc && doc._id && vehicle) {
            const __VEHICLE__ = require('./vehicle');
            vehicleDoc = await __VEHICLE__.Model.findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(vehicle) },
              {
                $push: {
                  contracts: {
                    contract: doc._id,
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
