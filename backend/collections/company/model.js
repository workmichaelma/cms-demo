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
          vehicle_value,
          name_tc,
          ...args
        } = obj

        const vehicleId = vehicleIds[vehicle]

        if (!name_tc) {
          console.error(`Failed to import row[${key}], reason: no name_tc`)
        } else if (!isEmpty(error)) {
          console.error(
            `Failed to import row[${key}], reason: ${JSON.stringify(error)}`
          )
        } else {
          const _doc = await super.updateOne({
            filter: { name_tc },
            body: args,
          })

          if (_doc && _doc?._id && vehicleId) {
            await this.insertVehicle({
              filter: { _id: _doc?._id },
              body: {
                target_id: vehicleId,
                effective_date: vehicle_effective_date || dayjs('2023-1-1'),
                end_date: vehicle_end_date,
                value: vehicle_value,
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
    const { relation, ...args } = body
    const { _id } = filter

    let doc
    if (relation) {
      const { collection, action, doc_id, target_id, ...relationArgs } =
        relation
      switch (collection) {
        case 'vehicle':
          if (action === 'DELETE') {
            doc = await this.deleteVehicle({
              body: {
                target_id,
                doc_id,
              },
            })
          } else if (action === 'INSERT') {
            doc = await this.insertVehicle({
              filter: { _id },
              body: {
                target_id,
                ...relationArgs,
              },
            })
          } else if (action === 'UPDATE') {
            doc = await this.updateVehicle({
              body: {
                doc_id,
                target_id,
                ...relationArgs,
              },
            })
          }
      }
    } else if (!isEmpty(args)) {
      doc = await super.updateOne({ filter, body: args })
    }
    return doc
  }

  async deleteVehicle({ body }) {
    const { target_id, doc_id } = body

    return await this.Model.model('vehicle').deleteCompany({
      filter: {
        _id: target_id,
      },
      body: {
        doc_id,
      },
    })
  }

  async insertVehicle({ filter, body }) {
    const { _id } = filter
    const { target_id, ...args } = body

    return await this.Model.model('vehicle').insertCompany({
      filter: {
        _id: target_id,
      },
      body: {
        target_id: _id,
        ...args,
      },
    })
  }

  async updateVehicle({ body }) {
    const { doc_id, target_id, ...args } = body

    return await this.Model.model('vehicle').updateCompany({
      filter: {
        _id: target_id,
      },
      body: {
        doc_id,
        ...args,
      },
    })
  }

  async getAllVehicles({ _id }) {
    try {
      const query = [
        {
          $match: {
            'companies.company': new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $unwind: '$companies',
        },
        {
          $match: {
            'companies.company': new mongoose.Types.ObjectId(_id),
          },
        },
        {
          $sort: {
            'companies.updatedAt': 1,
          },
        },
        {
          $lookup: {
            from: 'reg_marks',
            localField: 'current_reg_mark',
            foreignField: '_id',
            as: 'current_reg_mark',
          },
        },
      ]

      const _doc = await this.Model.model('vehicle').aggregate(query)

      if (_doc) {
        return _doc
      } else {
        throw new Error('No Record Found.')
      }
    } catch (err) {
      console.error(`Failed to getAllVehicle, reason: ${err}`)
      return null
    }
  }
}
