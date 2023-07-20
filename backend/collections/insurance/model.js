import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class Insurance extends Model {
  constructor() {
    super('insurance', schema)
    super.buildModel()
  }
}
