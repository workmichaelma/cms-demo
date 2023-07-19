const route = require('express').Router();
const { decrypt, encrypt } = require('../../helpers/crypto');
const core = require('./core');

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/user');

const collection_name = COLLECTIONS.USER;

route.use(async (req, res, next) => {
	await core.buildAPI({
		route,
		__MODEL__,
		collection_name,
		exclude: ['/get/:_id', '/lists'],
	});
	next();
});

// Fetch by frontend table
route.get('/lists', async (req, res) => {
	try {
		const { data, err } = await __MODEL__.Model.query(
			req,
			__MODEL__.schema,
			Object.keys(
				__MODEL__?.pageConfig?.pages?.listing?.fieldsToDisplay || {}
			) || []
		);
		const schema = __MODEL__.schema;
		const pageConfig = __MODEL__.pageConfig;
		if (err || !data) {
			throw new Error(err);
		} else {
			res.json({
				data: {
					...data,
					records: data.records.map((r) => {
						return {
							...r,
							password: undefined,
						};
					}),
				},
				schema,
				pageConfig,
			});
		}
	} catch (err) {
		console.error(`/app/controllers/api/${collection_name}/lists`, err);
		res.json(null);
	}
});

// Return entity By Id
route.get('/get/:_id', async (req, res) => {
	try {
		const { record: _record, err } = await __MODEL__.Model.findOneById({ req });
		const schema = __MODEL__.schema;
		const pageConfig = __MODEL__.pageConfig;
		if (err) {
			throw new Error(err);
		} else {
			const record = {
				..._record,
				password: decrypt(_record.password),
			};
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
