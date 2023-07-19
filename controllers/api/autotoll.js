const route = require('express').Router();
const core = require('./core');

const { COLLECTIONS } = require(_base + 'app/config/config');
const __MODEL__ = require(_base + 'app/models/autotoll');

const collection_name = COLLECTIONS.AUTOTOLL;

route.use(async (req, res, next) => {
	await core.buildAPI({ route, __MODEL__, collection_name });
	await core.buildAllSelect({
		route,
		__MODEL__,
		collection_name,
		label: 'autotoll_number',
	});
	next();
});

module.exports = route;
