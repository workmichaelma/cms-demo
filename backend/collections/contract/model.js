import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

export class Contract extends Model {
	constructor() {
		super('contract', schema)
		super.buildModel()
	}
}
