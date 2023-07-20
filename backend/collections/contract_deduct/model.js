import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

export class ContractDeduct extends Model {
	constructor() {
		super('contract_deduct', schema)
		super.buildModel()
	}
}
