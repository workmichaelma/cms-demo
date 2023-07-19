const route = require('express').Router();
const { isEmpty, compact } = require('lodash');
const core = require('./core');

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/contract_deduct');

const collection_name = COLLECTIONS.CONTRACT_DEDUCT;

route.use(async (req, res, next) => {
	await core.buildAPI({
		route,
		__MODEL__,
		collection_name,
		exclude: ['/get/:_id'],
	});
	// await core.buildAllSelect({
	// 	route,
	// 	__MODEL__,
	// 	collection_name,
	// 	label: 'contract_number',
	// });
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
			if (vehicles && !isEmpty(vehicles)) {
				record.vehicles = vehicles;
				record.current_vehicle = vehicles[0];
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

route.get(`/all-${collection_name}-select`, async (req, res) => {
	try {
		const _doc = await __MODEL__.Model.find(
			{},
			// { status: true },
			`_id contracts`
		).populate('contracts.contract');
		if (!_doc) {
			throw new Error(err);
		} else {
			const data = compact(
				_doc.map((v) => {
					const [contract] = v?.contracts || [];
					if (contract && contract?.contract?.contract_number) {
						return {
							label: contract.contract.contract_number,
							_id: v._id,
						};
					}
					return null;
				})
			).sort((a, b) => {
				return a.label > b.label ? 1 : -1;
			});
			res.json(data);
		}
	} catch (err) {
		console.error(
			`/app/controllers/api/${collection_name}/all-gps-select`,
			err
		);
		res.json(null);
	}
});

module.exports = route;
