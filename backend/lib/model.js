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
		created_at: { type: Date, default: Date.now },
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
	constructor(modelName, schema, metadata) {
		this.Schema = new mongoose.Schema(buildSchema(schema))
		this.Schema.plugin(mongooseLeanVirtuals)

		const { addLog = true } = metadata || {}
		this.user_id = null
		this.addLog = addLog
		this.modelName = modelName
		// this.Schema.statics.findOne = this.findOne
	}

	buildModel() {
		this.Model = mongoose.model(this.modelName, this.Schema)
	}

	async setUserId(user_id) {
		this.user_id = user_id
	}

	async findOne({ filter }) {
		return this.Model.findOne(filter).lean()
	}

	async findAll({ filter } = {}) {
		return this.Model.find(filter).lean()
	}

	async updateOne({ _id, body }) {
		try {
			const { _doc } = await this.Model.findOneAndUpdate({ _id }, body)
			if (_doc) {
				if (this.addLog) {
					this.Model.model('log').log({
						collection_name: this.modelName,
						action: 'UPDATE',
						doc_id: _id,
						old_data: _doc,
					})
				}

				return _doc
			} else {
				throw new Error(`Failed to update ${this.modelName} with id ${_id}`)
			}
		} catch (e) {
			console.error(e)
			return null
		}
	}

	async insert({ body }) {
		try {
			const { _doc } = await this.Model.create(body)

			if (_doc) {
				if (this.addLog) {
					this.Model.model('log').log({
						collection_name: this.modelName,
						action: 'ADD',
						doc_id: _doc._id,
						old_data: _doc,
					})
				}
				return _doc
			} else {
				throw new Error(`Failed to insert ${this.modelName}`)
			}
		} catch (e) {
			console.error(e)
			return null
		}
	}

	async deleteOne({ _id }) {
		try {
			const ok = await this.Model.deleteOne({ _id })

			if (ok?.deletedCount) {
				if (this.addLog) {
					this.Model.model('log').log({
						collection_name: this.modelName,
						action: 'DELETE',
						doc_id: _id,
					})
				}
				return ok
			} else {
				throw new Error(`Failed to delete ${this.modelName} with id ${_id}`)
			}
		} catch (e) {
			console.error(e)
			return null
		}
	}
}