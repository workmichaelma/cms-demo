import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class License extends Model {
  constructor() {
    super('license', schema)
    super.buildModel()
  }
}
