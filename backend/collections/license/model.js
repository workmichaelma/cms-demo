import lodash from 'lodash'
import mongoose from 'mongoose'
import dayjs from 'dayjs'
import { Model } from '#_/lib/model.js'
import { schema } from './config.js'
import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const { isEmpty, findKey, last, reduce, map, compact, uniq } = lodash

export class License extends Model {
  constructor() {
    super('license', schema)
    super.buildModel()
  }

  async import({ body }) {
    try {
      const requests = []

      const vehicles = await this.Model.model('vehicle').findAll({ filter: { chassis_number: { $in: uniq(compact(map(body, (item) => item.vehicle))) } } })
      const vehicleIds = reduce(
        vehicles,
        (obj, curr) => {
          obj[curr.chassis_number] = curr._id
          return obj
        },
        {}
      )

      for (const key in body) {
        const row = body[key]

        const { error, obj } = checkFieldIsValidToSchema({
          schema: [
            ...schema,
            {
              vehicle: {
                type: 'text',
              },
              vehicle_effective_date: {
                type: 'date',
              },
              vehicle_end_date: {
                type: 'date',
              },
              vehicle_value: {
                type: 'text',
              },
            },
          ],
          args: row,
        })
        const { vehicle, vehicle_effective_date, vehicle_end_date, license_fee, ...args } = obj
        const vehicleId = vehicleIds?.[vehicle]

        if (!vehicleId) {
          console.error(`Failed to import row[${key}], reason: vehicle [${vehicle} not found]`)
        } else if (!license_fee) {
          console.error(`Failed to import row[${key}], reason: no license_fee`)
        } else if (!isEmpty(error)) {
          console.error(`Failed to import row[${key}], reason: ${JSON.stringify(error)}`)
        } else {
          const _doc = await super.insert({ body: { ...args, license_fee } })
          if (_doc?._id) {
            await this.Model.model('vehicle').updateOne({
              filter: {
                _id: vehicleId,
              },
              body: {
                $push: {
                  licenses: [
                    {
                      license: _doc._id,
                      effective_date: vehicle_effective_date,
                      end_date: vehicle_end_date,
                    },
                  ],
                },
              },
            })
          }
          requests.push(_doc)
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
