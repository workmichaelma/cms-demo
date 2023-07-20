import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class GPS extends Model {
  constructor() {
    super('gps', schema)
    super.buildModel()
  }
}
