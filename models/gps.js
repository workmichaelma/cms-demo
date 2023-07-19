const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const { isEmpty, isUndefined, isString } = require('lodash');
const { checkFieldIsValid } = require('../helpers/common');
const {
  withVehicleField,
  withSchemaField,
  withProfileFieldsToDisplay,
} = require('../helpers/common');

const collection_name = COLLECTIONS.GPS;
const schema = {
  gps_number: {
    title: 'GPS No.',
    type: 'text',
    is_required: true,
    editable: false,
  },
  charge: {
    title: '每月費用',
    type: 'text',
    is_number_only: true,
    is_positive: true,
    show_dollar: true,
  },
  vehicles: {
    title: 'Vehicle',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      vehicle: {
        type: 'relation',
        foreign: 'vehicle',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Installation Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'Remove Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  current_vehicle: {
    title: 'Vehicle',
    type: 'relation',
    foreign: 'vehicle',
    foreign_label: '_id',
  },
};

const pageConfig = {
  title: 'GPS',
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withVehicleField,
        ...withSchemaField(schema, ['gps_number', 'charge']),
        vehicle_effective_date: '生效日期',
        vehicle_end_date: '結束日期',
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
  'vehicle_object_id',
]);

Schema.plugin(Core.updateLogPlugin);
/* Schema methods */
Schema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate();

    await Core.buildUpdate({
      _this: this,
      update,
      fields: ['effective_date', 'end_date'],
      arr_name: 'vehicles',
      key_name: 'vehicle',
      setCurrentVehicle: true,
    });

    // Update latest vehicle data
    // if (update['input__vehicle_object_id']) {
    // 	if (update['input__vehicle_effective_date']) {
    // 		update.$set['vehicles.$[vehicles].effective_date'] =
    // 			update['input__vehicle_effective_date'];
    // 	}
    // 	if (update['input__vehicle_end_date']) {
    // 		update.$set['vehicles.$[vehicles].end_date'] =
    // 			update['input__vehicle_end_date'];
    // 	}
    // 	this.setOptions({
    // 		arrayFilters: [{ 'vehicles._id': update['input__vehicle_object_id'] }],
    // 	});
    // Add a new vehicle record
    // } else if (!isUndefined(update['input__vehicle_id'])) {
    // await this.model.updateMany(
    // 	{ current_vehicle: update['input__vehicle_id'] },
    // 	{ $unset: { current_vehicle: 1 } }
    // );
    // update.$push = {};
    // update.$push['vehicles'] = {
    // 	vehicle: update['input__vehicle_id']
    // 		? new mongoose.Types.ObjectId(update['input__vehicle_id'])
    // 		: undefined,
    // 	effective_date: update['input__vehicle_effective_date'] || undefined,
    // 	end_date: update['input__vehicle_end_date'] || undefined,
    // };
    // update.$set = {
    // 	...update.$set,
    // 	current_vehicle: update['input__vehicle_id']
    // 		? new mongoose.Types.ObjectId(update['input__vehicle_id'])
    // 		: undefined,
    // };
    // }

    next();
  } catch (err) {
    console.error(err);
  }
});

// Create new record
Schema.pre('save', async function (next) {
  try {
    const {
      input__vehicle_id,
      input__vehicle_effective_date,
      input__vehicle_end_date,
    } = this;
    if (input__vehicle_id && isString(input__vehicle_id)) {
      this.vehicles = [
        {
          vehicle: input__vehicle_id,
          effective_date: input__vehicle_effective_date,
          end_date: input__vehicle_end_date,
        },
      ];
      this.current_vehicle = new mongoose.Types.ObjectId(input__vehicle_id);
      await this.constructor.updateMany(
        { current_vehicle: input__vehicle_id },
        { $unset: { current_vehicle: 1 } }
      );
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
        const { gps_number, vehicle, effective_date, end_date, charge } =
          fields;

        if (isEmpty(error) && vehicle) {
          const vehicleId = vehicle
            ? new mongoose.Types.ObjectId(vehicle)
            : null;
          if (vehicleId) {
            await this.updateMany(
              { current_vehicle: vehicleId },
              { $unset: { current_vehicle: 1 } }
            );
          }
          const update = {};
          update.$set = {
            charge,
            current_vehicle: vehicleId,
          };
          update.$push = {
            vehicles: {
              vehicle: vehicleId,
              effective_date,
              end_date,
            },
          };
          const doc = await this.findOneAndUpdate({ gps_number }, update, {
            upsert: true,
            new: true,
          });

          requests.push({
            err: false,
            doc,
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
