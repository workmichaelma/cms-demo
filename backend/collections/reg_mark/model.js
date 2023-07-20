import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class RegMark extends Model {
  constructor() {
    super('reg_mark', schema)
    super.buildModel()
  }
}
