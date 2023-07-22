import lodash from 'lodash'
import mongoose from 'mongoose'
import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'
import { checkFieldIsValidToSchema } from '#_/lib/common.js'
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

  async getAllAutoTolls({ _id }) {
    try {
      const query = [
        {
          $match: {
            'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $unwind: '$vehicles',
        },
        {
          $match: {
            'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $sort: {
            'vehicles.updatedAt': 1,
          },
        },
      ]

      const _doc = await this.Model.model('autotoll').aggregate(query)

      if (_doc) {
        return _doc
      } else {
        throw new Error('No Record Found.')
      }
    } catch (err) {
      console.error(`Failed to getAllAutotolls, reason: ${err}`)
      return null
    }
  }

  async getAllGpses({ _id }) {
    try {
      const query = [
        {
          $match: {
            'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $unwind: '$vehicles',
        },
        {
          $match: {
            'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $sort: {
            'vehicles.updatedAt': 1,
          },
        },
      ]

      const _doc = await this.Model.model('gps').aggregate(query)

      if (_doc) {
        return _doc
      } else {
        throw new Error('No Record Found.')
      }
    } catch (err) {
      console.erro(`Failed to getAllGpses, reason: ${err}`)
      return null
    }
  }

  async getAllFuels({ _id }) {
    try {
      const query = [
        {
          $match: {
            'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $unwind: '$vehicles',
        },
        {
          $match: {
            'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $sort: {
            'vehicles.updatedAt': 1,
          },
        },
      ]

      const _doc = await this.Model.model('fuel').aggregate(query)

      if (_doc) {
        return _doc
      } else {
        throw new Error('No Record Found.')
      }
    } catch (err) {
      console.error(`Failed to getAllFuels, reason: ${err}`)
      return null
    }
  }
}
