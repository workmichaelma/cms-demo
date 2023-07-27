import lodash from 'lodash'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { getFilterValue } from './common.js'

const { find, forEach, isEmpty, isUndefined, map } = lodash

const buildSchema = (schema) => {
  const fields = {
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    status: {
      type: Boolean,
      default: true,
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  }

  forEach(schema, (item) => {
    const { field: name } = item
    if (item.type === 'text') {
      fields[name] = {
        type: item.is_multiple ? [String] : String,
        required: item.is_required || false,
        select: item.select || true,
      }
    } else if (item.type === 'textarea') {
      fields[name] = {
        type: item.is_multiple ? [String] : String,
      }
    } else if (item.type === 'upload') {
      fields[name] = {
        type: item.is_multiple ? [String] : String,
      }
    } else if (item.type === 'date') {
      fields[name] = {
        type: item.is_multiple ? [Date] : Date,
        required: item.is_required || false,
      }
    } else if (item.type === 'object') {
      const childFields = buildSchema(item.child)
      fields[name] = {
        type: item.is_multiple ? [childFields] : childFields,
      }
    } else if (item.type === 'relation') {
      fields[name] = {
        type: item.is_multiple
          ? [mongoose.Schema.Types.ObjectId]
          : mongoose.Schema.Types.ObjectId,
        ref: item.foreign,
        required: item.is_required || false,
      }
    } else if (item.type === 'number') {
      fields[name] = {
        type: item.is_multiple ? [String] : String,
        required: item.is_required || false,
      }
    } else if (item.type === 'boolean') {
      fields[name] = {
        type: Boolean,
        required: item.is_required || false,
      }
    } else if (item.type === 'phone') {
      fields[name] = {
        type: item.is_multiple ? [String] : String,
        required: item.is_required || false,
        validate: {
          validator: function (v) {
            return /\d{8}/.test(v)
          },
          message: (props) => `${props.value} is not a valid phone number!`,
        },
      }
    }

    if (!isUndefined(item.default) && !isEmpty(fields[name])) {
      fields[name] = {
        ...fields[name],
        default: item.default,
      }
    }

    if (item.is_multiple) {
      fields[name] = {
        ...fields[name],
        default: item.default || [],
      }
    }
  })

  return fields
}

export class Model {
  constructor(modelName, schema, pageConfig, metadata) {
    this.pageConfig = pageConfig
    this.Schema = new mongoose.Schema(buildSchema(schema))
    this.Schema.plugin(mongooseLeanVirtuals)

    const { addLog = true } = metadata || {}
    this.user_id = null
    this.addLog = addLog
    this.modelName = modelName
    this.schema = schema
    // this.Schema.statics.findOne = this.findOne
  }

  buildModel() {
    this.Schema.statics.findAll = this.findAll.bind(this)
    this.Schema.statics.updateOne = this.updateOne.bind(this)
    this.Model = mongoose.model(this.modelName, this.Schema)
  }

  async setUserId(user_id) {
    this.user_id = user_id
  }

  async distinct(field) {
    return this.Model.distinct(field)
  }

  async findOne({ filter, populate = '' }) {
    return this.Model.findOne(filter).populate(populate).lean()
  }

  async findAll({ filter = {} } = {}) {
    return this.Model.find(filter).lean()
  }

  async updateOne({ filter, body = {}, options }) {
    try {
      let old_data

      if (this.addLog) {
        old_data = (await this.findOne({ filter })) || null
      }
      const _doc = await this.Model.findOneAndUpdate(
        filter,
        {
          ...body,
          updated_at: new Date(),
        },
        {
          upsert: true,
          lean: true,
          new: true,
          ...options,
        }
      )

      if (this.addLog && _doc?._id) {
        if (old_data === null) {
          this.Model.model('log').log({
            collection_name: this.modelName,
            action: 'INSERT',
            doc_id: _doc._id,
            new_data: _doc,
          })
        } else {
          this.Model.model('log').log({
            collection_name: this.modelName,
            action: 'UPDATE',
            doc_id: _doc._id,
            new_data: _doc,
            old_data,
          })
        }

        return _doc
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async updateMany({ filter, body }) {
    try {
      const result = await this.Model.updateMany(filter, body)
      if (this.addLog) {
      }
      return result
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async insert({ body }) {
    try {
      const { _doc } = await this.Model.create(body)

      if (_doc) {
        if (this.addLog) {
          this.Model.model('log').log({
            collection_name: this.modelName,
            action: 'INSERT',
            doc_id: _doc._id,
            new_data: _doc,
          })
        }
        return _doc
      } else {
        throw new Error(`Failed to insert ${this.modelName}`)
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async deleteOne({ _id }) {
    try {
      const ok = await this.Model.deleteOne({ _id })

      if (ok?.deletedCount) {
        if (this.addLog) {
          this.Model.model('log').log({
            collection_name: this.modelName,
            action: 'DELETE',
            doc_id: _id,
          })
        }
        return ok
      } else {
        throw new Error(`Failed to delete ${this.modelName} with id ${_id}`)
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async listing({ filter, sort, page = 1, pageSize = 50 }, pipelines = {}) {
    let pipeline = []
    const { fieldsToDisplay } = find(this.pageConfig?.pages, {
      page: 'listing',
    })
    const { searchPipeline = [], projectionPipeline = [] } = pipelines

    const skip = (page - 1) * pageSize
    const limit = pageSize
    if (!isEmpty(searchPipeline)) {
      pipeline = [...pipeline, ...searchPipeline]
    }

    const projection = fieldsToDisplay.reduce((fields, field) => {
      fields[field] = `$${field}`
      return fields
    }, {})

    projectionPipeline.push({
      $project: projection,
    })

    if (filter) {
      const filters = map(filter, (item) => {
        const { field, operator } = item
        const value = getFilterValue(item)
        return {
          [field]: {
            [operator]: value,
          },
        }
      })
      if (!isEmpty(filters)) {
        pipeline.push({ $match: { $and: filters } })
      }
    }

    if (sort) {
      const order = sort.field === 'DESC' ? -1 : 1
      pipeline.push({
        $facet: {
          records: [
            ...projectionPipeline,
            {
              $sort: { [sort.field]: order },
            },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: 'count' }],
        },
      })
    } else {
      pipeline.push({
        $facet: {
          records: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            { $skip: skip },
            { $limit: limit },
            ...projectionPipeline,
          ],
          totalCount: [{ $count: 'count' }],
        },
      })
    }

    const result = await this.Model.aggregate(pipeline)

    if (result) {
      const [{ records, totalCount }] = result || {}
      const count = !isEmpty(records) ? totalCount[0]?.count : 0
      return {
        data: records,
        metadata: {
          total: count,
          page,
          pageSize,
          hasNextPage: (page - 1) * pageSize + records?.length < count,
          hasPrevPage: page > 1,
          pipeline,
        },
      }
    }
    console.log({ filter, sort, page, pageSize })
    return {
      data: [],
      metadata: {},
    }
  }
}
