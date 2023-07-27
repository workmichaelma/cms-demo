import { Model } from '#_/lib/model.js'
import { schema, pageConfig } from './config.js'

export class ContractDeduct extends Model {
  constructor() {
    super('contract_deduct', schema, pageConfig)
    super.buildModel()
  }
}
