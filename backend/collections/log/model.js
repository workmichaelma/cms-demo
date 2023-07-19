import { diff } from 'just-diff'
import { Model } from '#_/lib/model.js'
import { schema } from './config.js'
import lodash from 'lodash'
const { clone } = lodash

export class Log extends Model {
	constructor() {
		super('log', schema, { addLog: false })
		this.Schema.statics.log = this.log.bind(this)

		super.buildModel()
	}

	async log({ collection_name, action, doc_id, old_data }) {
		const oldData = this.removeDataField(old_data)

		if (action === 'UPDATE') {
			const new_data = await this.Model.model(collection_name)
				.findOne({
					_id: doc_id,
				})
				.lean()

			const newData = this.removeDataField(new_data)
			const difference = diff(
				this.removeDataField(oldData),
				this.removeDataField(newData)
			)
			if (new_data && old_data) {
				this.Model.create({
					collection_name,
					action,
					doc_id: doc_id.toString(),
					old_data: JSON.stringify(oldData),
					data: JSON.stringify(newData),
					difference: JSON.stringify(difference),
				})
			}
		}

		if (action === 'ADD') {
			this.Model.create({
				collection_name,
				action,
				doc_id: doc_id.toString(),
				data: JSON.stringify(oldData),
			})
		}
	}

	removeDataField(data) {
		const value = { ...data }
		delete value._id
		delete value.created_at
		delete value.updated_at
		delete value.created_by
		delete value.updated_by
		delete value.__v
		return value
	}
}
