import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class Fuel extends Model {
  constructor() {
    super('fuel', schema)
    super.buildModel()
  }
}
