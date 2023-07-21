import lodash from 'lodash'
import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

const { forEach, isEmpty, isUndefined } = lodash

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
        type: item.is_multiple ? [mongoose.Schema.Types.ObjectId] : mongoose.Schema.Types.ObjectId,
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
  constructor(modelName, schema, metadata) {
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
    this.Model = mongoose.model(this.modelName, this.Schema)
  }

  async setUserId(user_id) {
    this.user_id = user_id
  }

  async findOne({ filter }) {
    return this.Model.findOne(filter).lean()
  }

  async findAll({ filter } = {}) {
    return this.Model.find(filter).lean()
  }

  async updateOne({ filter, body }) {
    try {
      const result = await this.Model.findOneAndUpdate(filter, body, { upsert: true })

      if (this.addLog) {
        if (result === null) {
          const { _id } = await this.findOne({ filter })
          if (_id) {
            this.Model.model('log').log({
              collection_name: this.modelName,
              action: 'INSERT',
              doc_id: _id,
              old_data: {
                ...filter,
                ...body,
              },
            })
          }
        } else if (result?._doc) {
          this.Model.model('log').log({
            collection_name: this.modelName,
            action: 'UPDATE',
            doc_id: result?._doc?._id,
            old_data: result?._doc,
          })
        }

        return result
      } else {
        throw new Error(`Failed to update ${this.modelName} with filter ${JSON.stringify(filter)}`)
      }
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
            old_data: _doc,
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
}
