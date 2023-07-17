import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

export class Company extends Model {
	constructor() {
		super('company', schema)
	}
}
