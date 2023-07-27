import lodash from 'lodash'
import dayjs from 'dayjs'
import mongoose from 'mongoose'
const {
  clone,
  isBoolean,
  isEmpty,
  isNaN,
  isUndefined,
  find,
  forEach,
  toNumber,
} = lodash

export const isISODateString = (str) => {
  try {
    const day = new Date(str)
    return day.toISOString() === str
  } catch {
    return false
  }
}

export const toISOString = (str) => {
  try {
    if (str) {
      const day = dayjs(str)
      if (day.isValid()) {
        return day.toISOString()
      }
    }
    return undefined
  } catch {
    return undefined
  }
}

export const checkFieldIsValidToSchema = ({ schema, args }) => {
  const error = {}
  const obj = clone(args)
  forEach(obj, (value, field) => {
    const config = find(schema, { field })

    if (isUndefined(value) || isEmpty(value)) {
      obj[field] = undefined
    }
    if (config?.is_required && isUndefined(value)) {
      error[field] = `[ ${field} ] cannot be null`
    } else if (config && !isUndefined(value)) {
      switch (config.type) {
        case 'boolean':
          if (!isBoolean(value)) {
            error[
              field
            ] = `[ ${field} ], Expected boolean value. Value: ${value}`
          }
          return
        case 'date':
          if (isUndefined(value) || isEmpty(value)) {
            obj[field] = undefined
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            error[field] = `[ ${field} ], Expected date format. Value: ${value}`
          } else {
            obj[field] = toISOString(value)
          }
          return
        case 'number':
          if (isUndefined(value) || isEmpty(value)) {
            obj[field] = undefined
          } else {
            const numberValue = toNumber(value.replace(/,/g, ''))
            if (!isNaN(numberValue)) {
              obj[field] = numberValue
            } else {
              error[
                field
              ] = `[ ${field} ], Expected number format. Value: ${value}`
            }
          }
          break
        default:
          break
      }
    }
  })
  return {
    error,
    obj,
  }
}

export const getFilterValue = ({ field, operator, value }) => {
  let v = value
  if (field.endsWith('_id')) {
    v = new mongoose.Types.ObjectId(value)
  } else if (value === 'true') {
    v = true
  } else if (value === 'false') {
    v = false
  } else if (field.endsWith('_date') || field === 'dob') {
    v = new Date(value)
  }

  if (operator === '$regex') {
    v = new RegExp(v, 'i')
  }

  return v
}
