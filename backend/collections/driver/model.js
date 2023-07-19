import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class Driver extends Model {
	constructor() {
		super('driver', schema)
		super.buildModel()
	}
}