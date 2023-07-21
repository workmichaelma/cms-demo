import lodash from 'lodash'
import mongoose from 'mongoose'
import dayjs from 'dayjs'
import { Model } from '#_/lib/model.js'
import { schema } from './config.js'
import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const { isEmpty, findKey, last, reduce, map, compact, uniq } = lodash

export class Company extends Model {
  constructor() {
    super('company', schema)
    super.buildModel()
  }

  async import({ body }) {
    try {
      const updateVehicles = {}
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
        const { name_tc, vehicle, vehicle_effective_date, vehicle_end_date, vehicle_value, ...args } = obj

        if (!name_tc) {
          console.error(`Failed to import row[${key}], reason: no name_tc`)
        } else if (!isEmpty(error)) {
          console.error(`Failed to import row[${key}], reason: ${JSON.stringify(error)}`)
        } else {
          const _doc = await super.updateOne({ filter: { name_tc }, body: args })
          const vehicleId = (vehicleIds?.[vehicle] || '').toString()
          if (vehicleId) {
            let companyId
            if (_doc?._id) {
              companyId = _doc._id.toString()
            } else {
              const item = await super.findOne({ filter: { name_tc } })
              if (item && item?._id) {
                companyId = item._id.toString()
              }
            }

            if (companyId) {
              const companyObj = {
                company: companyId,
                effective_date: vehicle_effective_date || dayjs('2023-1-1'),
                end_date: vehicle_end_date,
                value: vehicle_value,
              }
              updateVehicles[vehicleId] = [...(updateVehicles[vehicleId] || []), companyObj]
            }
          }

          requests.push(_doc)
        }
      }

      const _docs = await Promise.all(requests)
      const updateVehiclesRequests = []
      for (const vehicleId in updateVehicles) {
        const companies = updateVehicles[vehicleId]
        const _doc = await this.Model.model('vehicle').updateOne({
          filter: {
            _id: new mongoose.Types.ObjectId(vehicleId),
          },
          body: {
            $push: {
              companies,
            },
          },
        })
        updateVehiclesRequests.push(_doc)
      }
      const updatedVehicles = await Promise.all(updateVehiclesRequests)

      return _docs?.length + updatedVehicles?.length
    } catch (err) {
      console.error(`Failed to import, reason: ${err}`)
      return 0
    }
  }
}
