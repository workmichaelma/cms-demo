const { ObjectID } = require('mongodb');
const moment = require('moment');
const { isArray, isEmpty } = require('lodash');
const route = require('express').Router();

const { COLLECTIONS } = require(_base + 'app/config/config');
const __LOG__ = require(_base + 'app/models/log');

const collection_name = COLLECTIONS.LOG;

const schema = {
	collection_name: {
		title: 'Database',
	},
	createdAt: {
		title: 'Created At',
	},
	action: {
		title: 'Action',
	},
};

// Fetch by frontend table
route.get('/lists', async (req, res) => {
	try {
		const { data, err } = await __LOG__.query(req);
		if (err || !data) {
			throw new Error(err);
		} else {
			res.json({ data, schema });
		}
	} catch (err) {
		console.error(`/app/controllers/api/${collection_name}/lists`, err);
		res.json(null);
	}
});

// Return entity By Id
route.get('/get/:_id', async (req, res) => {
	try {
		const { record, err } = await __LOG__.findOneById({ req });
		if (err) {
			throw new Error(err);
		} else {
			res.json({
				record,
			});
		}
	} catch (err) {
		console.error(`/app/controllers/api/${collection_name}/get/:id`, err);
		res.send(null);
	}
});

module.exports = route;
