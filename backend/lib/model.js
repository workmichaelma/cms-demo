import lodash from 'lodash'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

const { isEmpty, isUndefined } = lodash

const buildSchema = (schema) => {
	const fields = {
		updated_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
		},
		status: {
			type: Boolean,
			default: true,
		},
	}

	schema.forEach((item) => {
		const { field: name } = item
		if (item.type === 'text') {
			fields[name] = {
				type: item.is_multiple ? [String] : String,
				required: item.is_required || false,
				select: item.select || true,
			}
		} else if (item.type === 'textarea') {
			fields[name] = {
				type: item.is_multiple ? [String] : String,
			}
		} else if (item.type === 'upload') {
			fields[name] = {
				type: item.is_multiple ? [String] : String,
			}
		} else if (item.type === 'date') {
			fields[name] = {
				type: item.is_multiple ? [Date] : Date,
				required: item.is_required || false,
			}
		} else if (item.type === 'object') {
			const childFields = buildSchema(item.child)
			fields[name] = {
				type: item.is_multiple ? [childFields] : childFields,
			}
		} else if (item.type === 'relation') {
			fields[name] = {
				type: item.is_multiple
					? [mongoose.Schema.Types.ObjectId]
					: mongoose.Schema.Types.ObjectId,
				ref: item.foreign,
				required: item.is_required || false,
			}
		} else if (item.type === 'number') {
			fields[name] = {
				type: item.is_multiple ? [String] : String,
				required: item.is_required || false,
			}
		} else if (item.type === 'boolean') {
			fields[name] = {
				type: Boolean,
				required: item.is_required || false,
			}
		} else if (item.type === 'phone') {
			fields[name] = {
				type: item.is_multiple ? [String] : String,
				required: item.is_required || false,
				validate: {
					validator: function (v) {
						return /\d{8}/.test(v)
					},
					message: (props) => `${props.value} is not a valid phone number!`,
				},
			}
		}

		if (!isUndefined(item.default) && !isEmpty(fields[name])) {
			fields[name] = {
				...fields[name],
				default: item.default,
			}
		}

		if (item.is_multiple) {
			fields[name] = {
				...fields[name],
				default: item.default || [],
			}
		}
	})

	return fields
}

export class Model {
	constructor(modelName, schema) {
		this.Schema = new mongoose.Schema(buildSchema(schema))
		this.Schema.plugin(mongooseLeanVirtuals)
		this.Model = mongoose.model(modelName, this.Schema)

		this.Schema.statics.findOne = this.findOne
	}

	async findOne({ filter }) {
		console.log(filter)
		return this.Model.findOne(filter).lean()
	}

	async findAll({ filter } = {}) {
		return this.Model.find(filter).lean()
	}

	async insert({ body, user_id }) {
		try {
			const _doc = await this.Model.create(body)

			if (_doc) {
				return _doc
			} else {
				throw new Error(`Failed to insert ${modelName}`)
			}
		} catch (e) {
			console.error(e)
			return null
		}
	}
}
