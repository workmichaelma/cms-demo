const route = require('express').Router();
const { isEmpty } = require('lodash');
const core = require('./core');

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/contract');

const collection_name = COLLECTIONS.CONTRACT;

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
		label: 'contract_number',
		sort: { contract_number: 1 },
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
			const { _doc } = await __MODEL__.Model.getAllVehicles(record);
			if (_doc && !isEmpty(_doc)) {
				record.vehicles = _doc;
				record.current_vehicle = _doc[0];
			}
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
