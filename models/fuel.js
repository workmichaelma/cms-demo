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

const title = 'Fuel';
const collection_name = COLLECTIONS.FUEL;
const schema = {
	fuel_type: {
		title: '燃油種類',
		type: 'text',
		is_required: true,
		select: true,
		free_solo: true,
	},
	provider: {
		title: '供應商',
		type: 'text',
		select: true,
		free_solo: true,
	},
	account_number: {
		title: '油咭賬號',
		type: 'text',
	},
	card_number: {
		title: '油咭號碼',
		type: 'text',
		select: true,
		free_solo: true,
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
				...withSchemaField(schema, ['fuel_type', 'provider', 'card_number']),
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

// Update record
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
		// if (update['input__vehicle_effective_date']) {
		// 	update.$set['vehicles.$[vehicles].effective_date'] =
		// 		update['input__vehicle_effective_date'];
		// }
		// if (update['input__vehicle_end_date']) {
		// 	update.$set['vehicles.$[vehicles].end_date'] =
		// 		update['input__vehicle_end_date'];
		// }
		// this.setOptions({
		// 	arrayFilters: [{ 'vehicles._id': update['input__vehicle_object_id'] }],
		// });
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
				const update = {};
				const { error, fields } = checkFieldIsValid({ schema, args: row });
				const {
					card_number,
					vehicle,
					vehicle_effective_date,
					vehicle_end_date,
					...args
				} = fields;

				let vehicles = [];

				if (isEmpty(error) && vehicle) {
					const vehicleId = vehicle
						? new mongoose.Types.ObjectId(vehicle)
						: null;
					const current_vehicle = {
						current_vehicle: vehicleId,
					};

					if (vehicleId) {
						await this.updateMany(
							{ current_vehicle: vehicleId },
							{ $unset: { current_vehicle: 1 } }
						);
					}
					vehicles.push({
						vehicle: vehicleId,
						effective_date: vehicle_effective_date,
						end_date: vehicle_end_date,
					});
					update.$push = { vehicles: vehicles[0] };
					update.$set = {
						...args,
						...current_vehicle,
					};
					let doc = null;
					if (card_number) {
						doc = await this.findOneAndUpdate({ card_number }, update, {
							upsert: true,
							new: true,
						});
					} else {
						doc = await this.create({ ...args, vehicles, ...current_vehicle });
					}

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
	title,
	pageConfig,
};
