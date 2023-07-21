import mongoose from 'mongoose'
import lodash from 'lodash'
import dayjs from 'dayjs'
import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const { isEmpty, findKey, last, reduce, map, compact, uniq } = lodash
export class GPS extends Model {
  constructor() {
    super('gps', schema)
    super.buildModel()
  }

  async import({ body }) {
    try {
      const unsetCurrentVehicles = []
      const requests = {}

      const vehicles = await this.Model.model('vehicle').findAll({ filter: { chassis_number: { $in: uniq(compact(map(body, (item) => item.vehicle))) } } })

      const vehicleIds = reduce(
        vehicles,
        (obj, curr) => {
          obj[curr.chassis_number] = curr._id
          return obj
        },
        {}
      )
      const items = reduce(
        body,
        (item, row, key) => {
          const { error, obj } = checkFieldIsValidToSchema({
            schema: [
              ...schema,
              {
                field: 'vehicle',
                type: 'text',
              },
              {
                field: 'vehicle_effective_date',
                type: 'date',
              },
              {
                field: 'vehicle_end_date',
                type: 'date',
              },
            ],
            args: row,
          })
          const { vehicle, vehicle_effective_date, vehicle_end_date, gps_number } = obj

          const vehicleId = vehicleIds[vehicle]

          if (!gps_number) {
            console.error(`Failed to import row[${key}], reason: no gps_number`)
          } else if (!vehicleId) {
            console.error(`Failed to import row[${key}], reason: vehicle [${vehicle}] not found`)
          } else if (!isEmpty(error)) {
            console.error(`Failed to import row[${key}], reason: ${JSON.stringify(error)}`)
          } else {
            const vehicleObj = {
              vehicle: vehicleId,
              effective_date: vehicle_effective_date || dayjs('2023-1-1'),
              end_date: vehicle_end_date,
            }
            item[gps_number] = {
              vehicles: [...(item[gps_number]?.vehicles || []), vehicleObj],
            }
          }
          return item
        },
        {}
      )

      for (const key in items) {
        const item = items[key]
        const latestVehicle = last(item.vehicles).vehicle
        const update = {
          $push: {
            vehicles: item.vehicles,
          },
        }
        const prevCurrentVehicleKey = findKey(requests, { current_vehicle: latestVehicle })
        if (prevCurrentVehicleKey) {
          requests[prevCurrentVehicleKey].current_vehicle = undefined
        }
        unsetCurrentVehicles.push(latestVehicle)
        requests[key] = { current_vehicle: latestVehicle, update }
      }

      return await super
        .updateMany({
          filter: {
            current_vehicle: {
              $in: unsetCurrentVehicles,
            },
          },
          body: {
            $unset: {
              current_vehicle: 1,
            },
          },
        })
        .then(async () => {
          const requestResults = await Promise.all(
            map(requests, ({ update, current_vehicle }, gps_number) => {
              return super.updateOne({
                filter: {
                  gps_number,
                },
                body: {
                  ...update,
                  current_vehicle,
                },
              })
            })
          )

          return requestResults.length
        })
    } catch (err) {
      console.error(`Failed to import, reason: ${err}`)
      return {
        err,
      }
    }
  }
}
