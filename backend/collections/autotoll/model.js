import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

export class Autotoll extends Model {
	constructor() {
		super('autotoll', schema)
		super.buildModel()
	}
}
