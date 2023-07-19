import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

export class File extends Model {
	constructor() {
		super('file', schema)
		super.buildModel()
	}
}
