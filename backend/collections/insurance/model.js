import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema, pageConfig } from './config.js'

export class Insurance extends Model {
  constructor() {
    super('insurance', schema, pageConfig)
    super.buildModel()
  }
}
