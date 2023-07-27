import mongoose from 'mongoose'
import lodash from 'lodash'
import dayjs from 'dayjs'
import { Model } from '#_/lib/model.js'
import { schema, pageConfig } from './config.js'

import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const { isEmpty, findKey, last, reduce, map, compact, uniq } = lodash

export class RegMark extends Model {
  constructor() {
    super('reg_mark', schema, pageConfig)
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
          reg_mark,
          ...args
        } = obj

        const vehicleId = vehicleIds[vehicle]

        if (!reg_mark) {
          console.error(`Failed to import row[${key}], reason: no reg_mark`)
        } else if (!isEmpty(error)) {
          console.error(
            `Failed to import row[${key}], reason: ${JSON.stringify(error)}`
          )
        } else {
          const _doc = await super.updateOne({
            filter: { reg_mark },
            body: args,
          })

          if (_doc && _doc?._id && vehicleId) {
            await this.insertVehicle({
              filter: { _id: _doc._id },
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
              body: {
                doc_id,
                target_id,
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
              body: {
                target_id,
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
      doc = await super.updateOne({ filter, body: args })
    }

    return doc
  }

  async deleteVehicle({ body }) {
    try {
      const { doc_id, target_id } = body

      return await this.Model.model('vehicle').updateOne({
        filter: {
          _id: target_id,
        },
        body: {
          relation: {
            collection: 'regMark',
            action: 'DELETE',
            doc_id,
          },
        },
      })
    } catch (err) {
      console.error(
        `[${this.modelName}] Failed to DELETE vehicle, reason: ${err}`
      )
      return null
    }
  }

  async insertVehicle({ filter, body }) {
    try {
      const { _id } = filter
      const { target_id, ...args } = body

      return await this.Model.model('vehicle').updateOne({
        filter: {
          _id: target_id,
        },
        body: {
          relation: {
            collection: 'regMark',
            action: 'INSERT',
            target_id: _id,
            ...args,
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

  async updateVehicle({ body }) {
    try {
      const { target_id, doc_id, ...args } = body

      return await this.Model.model('vehicle').updateOne({
        filter: {
          _id: target_id,
        },
        body: {
          relation: {
            collection: 'regMark',
            action: 'UPDATE',
            doc_id,
            ...args,
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
