const Core = require('./core');
const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const crypto = require(_base + 'app/helpers/crypto');
const { COLLECTIONS, dbMap } = require(_base + 'app/config/config');
const { compact, isArray, isEmpty } = require('lodash');

const collection_name = COLLECTIONS.LOG;
const Schema = new mongoose.Schema(
	{
		collection_name: {
			type: String,
		},
		action: {
			type: String,
		},
		doc_id: {
			type: String,
		},
		old_data: {
			type: String,
		},
		data: {
			type: String,
		},
		difference: {
			type: String,
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
		},
		created_at: {
			type: Date,
		},
	},
	{ timestamps: true }
);

Schema.virtual('database').get(function () {
	return dbMap[this.collection_name];
});

Schema.statics.query = async function (req) {
	try {
		const { pipeline, page, pageSize } = req.query;
		const result = await this.aggregate(pipeline);
		if (result) {
			const [{ records, totalCount }] = result || {};

			const count = !isEmpty(records) ? totalCount[0]?.count : 0;

			return {
				data: {
					records,
					metadata: {
						total: count,
						page,
						pageSize,
						hasNextPage: (page - 1) * pageSize + records.length < count,
						hasPrevPage: page > 1,
					},
				},
			};
		}
		return {
			err: 'Failed to query entity, something went wrong...',
		};
	} catch (err) {
		return {
			err,
		};
	}
};

Schema.statics.findOneById = async function ({ req }) {
	try {
		const { _id } = req.params || {};
		if (_id) {
			const { fields, ignoreFields } = req.query;
			const _fields = fields ? fields.split(',').join(' ') : '';
			const _ignoreFields = ignoreFields
				? ignoreFields
						.split(',')
						.map((v) => `-${v}`)
						.join(' ')
				: '';
			const select = compact([_fields, _ignoreFields]).join(' ');
			const record = await this.findOne({ _id })
				.select(select)
				.populate('created_by', '-password')
				.lean({ virtuals: true });
			if (record) {
				return { record };
			} else {
				throw new Error(`<${_id}> not found.`);
			}
		} else {
			throw new Error('No id provided');
		}
	} catch (err) {
		console.log(`Failed to find by ID, reason: ${err}`);
		return {
			err,
		};
	}
};

Schema.statics.log = async function ({
	old_data,
	doc_id,
	data,
	difference,
	collection_name,
	created_by,
	action,
}) {
	if (old_data) {
		delete old_data._id;
		delete old_data.updated_by;
		delete old_data.updated_at;
		delete old_data.__v;
	}

	delete data._id;
	delete data.updated_by;
	delete data.updated_at;
	delete data.__v;
	const entity = await this.create({
		old_data,
		doc_id,
		data,
		difference: JSON.stringify(difference),
		collection_name,
		created_by,
		action,
	});

	console.log(`Logged action: ${entity}`);
};
Schema.plugin(mongooseLeanVirtuals);

Schema.plugin(require('mongoose-autopopulate'));
const Model = mongoose.model(collection_name, Schema);

module.exports = Model;
