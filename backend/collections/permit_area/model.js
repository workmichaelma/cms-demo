import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class PermitArea extends Model {
  constructor() {
    super('permit_area', schema)
    super.buildModel()
  }
}
