import mongoose from 'mongoose'
import lodash from 'lodash'
import dayjs from 'dayjs'
import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const { isEmpty, findKey, last, reduce, map, compact, uniq } = lodash
export class Autotoll extends Model {
  constructor() {
    super('autotoll', schema)
    this.Schema.statics.insertVehicle = this.insertVehicle.bind(this)
    this.Schema.statics.deleteVehicle = this.deleteVehicle.bind(this)
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
          const { vehicle, vehicle_effective_date, vehicle_end_date, autotoll_number } = obj

          const vehicleId = vehicleIds[vehicle]

          if (!autotoll_number) {
            console.error(`Failed to import row[${key}], reason: no autotoll_number`)
          } else if (!vehicleId) {
            console.error(`Failed to import row[${key}], reason: vehicle [${vehicle}] not found`)
          } else if (!isEmpty(error)) {
            console.error(`Failed to import row[${key}], reason: ${JSON.stringify(error)}`)
          } else if (vehicle && autotoll_number) {
            const vehicleObj = {
              vehicle: vehicleId,
              effective_date: vehicle_effective_date || dayjs('2023-1-1'),
              end_date: vehicle_end_date,
            }
            item[autotoll_number] = {
              vehicles: [...(item[autotoll_number]?.vehicles || []), vehicleObj],
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
            map(requests, ({ update, current_vehicle }, autotoll_number) => {
              return super.updateOne({
                filter: {
                  autotoll_number,
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

  async deleteVehicle({ filter, body }) {
    try {
      const { _id } = filter
      const { doc_id } = body
      const docId = new mongoose.Types.ObjectId(doc_id)
      const _doc = await super
        .updateOne({
          filter: { _id },
          body: [
            {
              $set: {
                current_vehicle: {
                  $cond: [
                    {
                      $eq: [{ $arrayElemAt: ['$vehicles._id', -1] }, docId],
                    },
                    '$$REMOVE',
                    '$current_vehicle',
                  ],
                },
              },
            },
          ],
          options: {
            upsert: false,
          },
        })
        .then(async () => {
          return await super.updateOne({
            filter: { _id },
            body: {
              $pull: {
                vehicles: {
                  _id: docId,
                },
              },
            },
          })
        })

      return _doc
    } catch (err) {
      console.error(`Failed to insert vehicle to ${this.modelName}, reason: ${err}`)
      return null
    }
  }

  async insertVehicle({ filter, body }) {
    const { _id } = filter
    const { vehicle, effective_date, ...args } = body
    const vehicleId = new mongoose.Types.ObjectId(vehicle)
    const _doc = await super
      .updateMany({
        filter: {
          current_vehicle: vehicleId,
        },
        body: {
          $unset: {
            current_vehicle: 1,
          },
        },
      })
      .then(async () => {
        return await super.updateOne({
          filter: { _id },
          body: {
            $set: {
              'vehicles.$[vehicle].end_date': dayjs(effective_date).subtract(1, 'day'),
            },
          },
          options: {
            arrayFilters: [
              {
                'vehicle.end_date': { $exists: false },
              },
            ],
            projection: {
              vehicles: { $slice: -1 },
            },
          },
        })
      })
      .then(async () => {
        return super.updateOne({
          filter: { _id },
          body: {
            $set: {
              current_vehicle: vehicleId,
            },
            $push: {
              vehicles: {
                vehicle: vehicleId,
                effective_date,
                ...args,
              },
            },
          },
        })
      })

    return _doc
  }
}
