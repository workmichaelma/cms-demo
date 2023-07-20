import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class DriverPermit extends Model {
  constructor() {
    super('driver_permit', schema)
    super.buildModel()
  }
}
