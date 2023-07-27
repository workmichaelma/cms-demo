import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema, pageConfig } from './config.js'

export class Driver extends Model {
  constructor() {
    super('driver', schema, pageConfig)
    super.buildModel()
  }
}
