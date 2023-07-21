import lodash from 'lodash'
import mongoose from 'mongoose'
import dayjs from 'dayjs'
import { Model } from '#_/lib/model.js'
import { schema } from './config.js'
import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const { isEmpty, findKey, last, reduce, map, compact, uniq } = lodash

export class PermitArea extends Model {
  constructor() {
    super('permit_area', schema)
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
            },
          ],
          args: row,
        })
        const { vehicle, vehicle_effective_date, vehicle_end_date, area, ...args } = obj
        const vehicleId = vehicleIds?.[vehicle]

        if (!vehicleId) {
          console.error(`Failed to import row[${key}], reason: vehicle [${vehicle} not found]`)
        } else if (!area) {
          console.error(`Failed to import row[${key}], reason: no area`)
        } else if (!isEmpty(error)) {
          console.error(`Failed to import row[${key}], reason: ${JSON.stringify(error)}`)
        } else {
          const _doc = await super.insert({ body: { ...args, area } })
          if (_doc?._id) {
            await this.Model.model('vehicle').updateOne({
              filter: {
                _id: vehicleId,
              },
              body: {
                $push: {
                  permit_areas: [
                    {
                      permit_area: _doc._id,
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
