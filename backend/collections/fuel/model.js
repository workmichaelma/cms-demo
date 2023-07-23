import mongoose from 'mongoose'
import lodash from 'lodash'
import dayjs from 'dayjs'
import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const { isEmpty, findKey, last, reduce, map, compact, uniq } = lodash

export class Fuel extends Model {
  constructor() {
    super('fuel', schema)
    this.Schema.statics.insertVehicle = this.insertVehicle.bind(this)
    this.Schema.statics.deleteVehicle = this.deleteVehicle.bind(this)
    super.buildModel()
  }

  async import({ body }) {
    try {
      const requests = []

      const vehicles = await this.Model.model('vehicle').findAll({
        filter: {
          chassis_number: {
            $in: uniq(compact(map(body, (item) => item.vehicle))),
          },
        },
      })

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
        const {
          vehicle,
          vehicle_effective_date,
          vehicle_end_date,
          card_number,
          fuel_type,
          ...args
        } = obj

        const vehicleId = vehicleIds[vehicle]

        if (!fuel_type && !card_number) {
          console.error(
            `Failed to import row[${key}], reason: no either fuel_type or card_number`
          )
        } else if (!vehicleId) {
          console.error(
            `Failed to import row[${key}], reason: vehicle [${vehicle}] not found`
          )
        } else if (!isEmpty(error)) {
          console.error(
            `Failed to import row[${key}], reason: ${JSON.stringify(error)}`
          )
        } else {
          let _doc
          if (card_number) {
            _doc = await super.updateOne({
              filter: { card_number },
              body: args,
            })
          } else {
            _doc = await super.updateOne({
              filter: { fuel_type },
              body: args,
            })
          }

          if (_doc && _doc?._id && vehicleId) {
            await this.insertVehicle({
              filter: { _id: _doc?._id },
              body: {
                target_id: vehicleId,
                effective_date: vehicle_effective_date || dayjs('2023-1-1'),
                end_date: vehicle_end_date,
              },
            })
          }
          requests.push(_doc)
        }
      }

      const requestResult = await Promise.all(requests)

      return requestResult?.length
    } catch (err) {
      console.error(`Failed to import, reason: ${err}`)
      return {
        err,
      }
    }
  }

  async updateOne({ filter, body }) {
    const { _id } = filter
    const { relation, ...args } = body

    let doc
    if (relation) {
      const { collection, action, doc_id, target_id, ...relationArgs } =
        relation

      switch (collection) {
        case 'vehicle':
          if (action === 'DELETE') {
            doc = await this.deleteVehicle({
              filter: {
                _id,
              },
              body: {
                doc_id,
              },
            })
          } else if (action === 'INSERT') {
            doc = await this.insertVehicle({
              filter: {
                _id,
              },
              body: {
                target_id,
                ...relationArgs,
              },
            })
          } else if (action === 'UPDATE') {
            doc = await this.updateVehicle({
              filter: {
                _id,
              },
              body: {
                doc_id,
                ...relationArgs,
              },
            })
          }
          break
        default:
          break
      }
    } else if (!isEmpty(args)) {
      doc = await super.updateOne({
        filter,
        body: args,
      })
    }

    return doc
  }

  async deleteVehicle({ filter, body }) {
    try {
      const { _id } = filter
      const { doc_id } = body

      await super.updateOne({
        filter: { _id },
        body: [
          {
            $set: {
              current_vehicle: {
                $cond: [
                  {
                    $eq: [
                      { $arrayElemAt: ['$vehicles._id', -1] },
                      new mongoose.Types.ObjectId(doc_id),
                    ],
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
      return await super.updateOne({
        filter: { _id },
        body: {
          $pull: {
            vehicles: {
              _id: doc_id,
            },
          },
        },
      })
    } catch (err) {
      console.error(
        `Failed to insert vehicle to ${this.modelName}, reason: ${err}`
      )
      return null
    }
  }

  async updateVehicle({ filter, body }) {
    const { _id } = filter
    const { doc_id, ...args } = body

    const docId = new mongoose.Types.ObjectId(doc_id)
    return await super.updateOne({
      filter: {
        _id,
      },
      body: {
        $set: {
          ...reduce(
            args,
            (body, value, key) => {
              body[`vehicles.$[doc].${key}`] = value
              return body
            },
            {}
          ),
        },
      },
      options: {
        upsert: false,
        arrayFilters: [
          {
            [`doc._id`]: docId,
          },
        ],
      },
    })
  }

  async insertVehicle({ filter, body }) {
    try {
      const { _id } = filter
      const { target_id, effective_date, ...args } = body

      await super.updateMany({
        filter: {
          current_vehicle: target_id,
        },
        body: {
          $unset: {
            current_vehicle: 1,
          },
        },
      })
      await super.updateOne({
        filter: { _id },
        body: {
          $set: {
            'vehicles.$[vehicle].end_date': dayjs(effective_date).subtract(
              1,
              'day'
            ),
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
      return await super.updateOne({
        filter: { _id },
        body: {
          $set: {
            current_vehicle: target_id,
          },
          $push: {
            vehicles: {
              vehicle: target_id,
              effective_date,
              ...args,
            },
          },
        },
      })
    } catch (err) {
      console.error(
        `[${this.modelName}] Failed to INSERT vehicle, reason: ${err}`
      )
      return null
    }
  }
}
