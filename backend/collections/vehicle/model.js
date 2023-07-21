import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'
import { checkFieldIsValidToSchema } from '#_/lib/common.js'
import lodash from 'lodash'
const { isEmpty } = lodash

export class Vehicle extends Model {
  constructor() {
    super('vehicle', schema)
    super.buildModel()
  }

  async import({ body }) {
    try {
      const requests = []

      for (const key in body) {
        const row = body[key]

        const { error, obj } = checkFieldIsValidToSchema({ schema, args: row })
        const { chassis_number, ...args } = obj

        if (!chassis_number) {
          console.error(`Failed to import row[${key}], reason: no chassis_number`)
        } else if (!isEmpty(error)) {
          console.error(`Failed to import row[${key}], reason: ${JSON.stringify(error)}`)
        } else {
          requests.push(super.updateOne({ filter: { chassis_number }, body: args }))
        }
      }

      const _docs = await Promise.all(requests)

      return _docs?.length
    } catch (err) {
      console.error(`Failed to import, reason: ${err}`)
      return 0
    }
  }
}
