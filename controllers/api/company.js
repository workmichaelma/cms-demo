const route = require('express').Router();
const core = require('./core');

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/company');

const collection_name = COLLECTIONS.COMPANY;

route.use(async (req, res, next) => {
	await core.buildAPI({
		route,
		__MODEL__,
		collection_name,
		exclude: ['/get/:_id'],
	});
	await core.buildAllSelect({
		route,
		__MODEL__,
		collection_name,
		label: 'short_name',
	});
	next();
});

// Return entity By Id
route.get('/get/:_id', async (req, res) => {
	try {
		const { record, err } = await __MODEL__.Model.findOneById({ req });
		const schema = __MODEL__.schema;
		const pageConfig = __MODEL__.pageConfig;
		if (record) {
			const { _doc: vehicles } = await __MODEL__.Model.getAllVehicles(record);
			const { _doc: drivers } = await __MODEL__.Model.getAllDrivers(record);

			record.vehicles = vehicles;
			record.drivers = drivers;
		}
		if (err) {
			throw new Error(err);
		} else {
			res.json({
				record,
				schema,
				pageConfig,
			});
		}
	} catch (err) {
		console.error(`/app/controllers/api/${collection_name}/get/:id`, err);
		res.send(null);
	}
});

module.exports = route;
