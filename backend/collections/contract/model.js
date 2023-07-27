import lodash from 'lodash'
import mongoose from 'mongoose'
import dayjs from 'dayjs'
import { Model } from '#_/lib/model.js'
import { schema, pageConfig } from './config.js'
import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const { isEmpty, findKey, last, reduce, map, compact, uniq } = lodash
export class Contract extends Model {
  constructor() {
    super('contract', schema, pageConfig)
    super.buildModel()
  }

  async import({ body }) {
    try {
      const updateVehicles = {}
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
        const {
          contract_number,
          vehicle,
          vehicle_effective_date,
          vehicle_end_date,
          ...args
        } = obj

        if (!contract_number) {
          console.error(
            `Failed to import row[${key}], reason: no contract_number`
          )
        } else if (!isEmpty(error)) {
          console.error(
            `Failed to import row[${key}], reason: ${JSON.stringify(error)}`
          )
        } else {
          const _doc = await super.updateOne({
            filter: { contract_number },
            body: args,
          })
          const vehicleId = (vehicleIds?.[vehicle] || '').toString()
          if (vehicleId) {
            let contractId
            if (_doc?._id) {
              contractId = _doc._id.toString()
            } else {
              const item = await super.findOne({ filter: { contract_number } })
              if (item && item?._id) {
                contractId = item._id.toString()
              }
            }

            if (contractId) {
              const contractObj = {
                contract: contractId,
                effective_date: vehicle_effective_date || dayjs('2023-1-1'),
                end_date: vehicle_end_date,
              }
              updateVehicles[vehicleId] = [
                ...(updateVehicles[vehicleId] || []),
                contractObj,
              ]
            }
          }

          requests.push(_doc)
        }
      }

      const _docs = await Promise.all(requests)
      const updateVehiclesRequests = []
      for (const vehicleId in updateVehicles) {
        const contracts = updateVehicles[vehicleId]
        const _doc = await this.Model.model('vehicle').updateOne({
          filter: {
            _id: new mongoose.Types.ObjectId(vehicleId),
          },
          body: {
            $push: {
              contracts,
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
