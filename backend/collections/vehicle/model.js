import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class Vehicle extends Model {
  constructor() {
    super('vehicle', schema)
    super.buildModel()
  }
}
