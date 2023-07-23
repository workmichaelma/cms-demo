import lodash from 'lodash'
import dayjs from 'dayjs'
import mongoose from 'mongoose'
import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'
import { checkFieldIsValidToSchema } from '#_/lib/common.js'
const { isEmpty, reduce } = lodash

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
          console.error(
            `Failed to import row[${key}], reason: no chassis_number`
          )
        } else if (!isEmpty(error)) {
          console.error(
            `Failed to import row[${key}], reason: ${JSON.stringify(error)}`
          )
        } else {
          requests.push(
            super.updateOne({ filter: { chassis_number }, body: args })
          )
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

  async updateOne({ filter, body }) {
    const { relation, ...args } = body
    const { _id } = filter

    let doc
    if (relation) {
      const { collection, action, doc_id, target_id, ...relationArgs } =
        relation
      switch (collection) {
        case 'gps':
        case 'autotoll':
        case 'fuel':
          if (action === 'DELETE') {
            doc = await this.Model.model(collection).deleteVehicle({
              filter: { _id: target_id },
              body: {
                doc_id,
              },
            })
          } else if (action === 'INSERT') {
            doc = await this.Model.model(collection).insertVehicle({
              filter: { _id: target_id },
              body: {
                vehicle: _id,
                ...relationArgs,
              },
            })
          } else if (action === 'UPDATE') {
            const updateDoc = reduce(
              relationArgs,
              (args, value, key) => {
                args[`vehicles.$.${key}`] = value
                return args
              },
              {}
            )
            doc = await this.Model.model(collection).updateOne({
              filter: {
                _id: target_id,
                'vehicles._id': new mongoose.Types.ObjectId(doc_id),
              },
              body: {
                $set: updateDoc,
              },
            })
          }
          break
        case 'regMark':
          if (action === 'DELETE') {
            doc = await this.deleteRegMark({
              filter,
              body: {
                doc_id,
              },
            })
          } else if (action === 'INSERT') {
            doc = await this.insertRegMark({
              filter,
              body: {
                target_id,
                ...relationArgs,
              },
            })
          } else if (action === 'UPDATE') {
            doc = await this.updateRegMark({
              filter,
              body: {
                doc_id,
                ...relationArgs,
              },
            })
          }
          break
        case 'company':
        case 'contract':
          const arrKeyMap = {
            company: 'companies',
            contract: 'contracts',
          }
          if (action === 'DELETE') {
            doc = await super.updateOne({
              filter,
              body: {
                $pull: {
                  companies: {
                    _id: new mongoose.Types.ObjectId(doc_id),
                  },
                },
              },
            })
          } else if (action === 'INSERT') {
            doc = await super.updateOne({
              filter,
              body: {
                $push: {
                  [arrKeyMap[collection]]: {
                    [collection]: new mongoose.Types.ObjectId(target_id),
                    ...relationArgs,
                  },
                },
              },
            })
          } else if (action === 'UPDATE') {
            const updateDoc = reduce(
              relationArgs,
              (args, value, key) => {
                args[`${arrKeyMap[collection]}.$.${key}`] = value
                return args
              },
              {}
            )
            doc = await super.updateOne({
              filter: {
                _id,
                [`${arrKeyMap[collection]}._id`]: new mongoose.Types.ObjectId(
                  doc_id
                ),
              },
              body: {
                $set: updateDoc,
              },
            })
          }
          break
        default:
      }
    } else if (!isEmpty(args)) {
      doc = await super.updateOne({ filter, body: args })
    }

    return doc
  }

  async deleteRegMark({ filter, body }) {
    const { _id } = filter
    const { doc_id } = body

    const docId = new mongoose.Types.ObjectId(doc_id)

    await super.updateOne({
      filter: {
        _id,
      },
      body: [
        {
          $set: {
            current_reg_mark: {
              $cond: [
                {
                  $eq: [{ $arrayElemAt: ['$reg_marks._id', -1] }, docId],
                },
                '$$REMOVE',
                '$current_reg_mark',
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
          reg_marks: {
            _id: docId,
          },
        },
      },
      options: {
        upsert: false,
      },
    })
  }

  async updateRegMark({ filter, body }) {
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
              body[`reg_marks.$[doc].${key}`] = value
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

  async insertRegMark({ filter, body }) {
    const { _id } = filter
    const { target_id, effective_date, ...args } = body

    const current_vehicle = await super.findOne({
      filter: { current_reg_mark: target_id },
    })

    if (current_vehicle?._id) {
      await super.updateOne({
        filter: { _id: current_vehicle._id },
        body: {
          $unset: {
            current_reg_mark: 1,
          },
          $set: {
            'reg_marks.$[doc].end_date': dayjs(effective_date).subtract(
              1,
              'day'
            ),
          },
        },
        options: {
          arrayFilters: [
            {
              'doc.end_date': { $exists: false },
              'doc.reg_mark': target_id,
            },
          ],
          projection: {
            reg_marks: { $slice: -1 },
          },
          upsert: false,
        },
      })
    }

    await super.updateOne({
      filter: { _id },
      body: {
        $set: {
          'reg_marks.$[doc].end_date': dayjs(effective_date).subtract(1, 'day'),
        },
      },
      options: {
        arrayFilters: [
          {
            'doc.end_date': { $exists: false },
          },
        ],
        projection: {
          reg_marks: { $slice: -1 },
        },
        upsert: false,
      },
    })

    return super.updateOne({
      filter: { _id },
      body: {
        $set: {
          current_reg_mark: target_id,
        },
        $push: {
          reg_marks: {
            reg_mark: target_id,
            effective_date,
            ...args,
          },
        },
      },
      options: {
        upsert: false,
      },
    })
  }
}
