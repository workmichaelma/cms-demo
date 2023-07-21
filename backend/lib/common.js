import lodash from 'lodash'
import dayjs from 'dayjs'
const { clone, isBoolean, isEmpty, isNaN, isUndefined, find, forEach, toNumber } = lodash

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

    if (config && !isUndefined(value) && !isEmpty(value)) {
      switch (config.type) {
        case 'boolean':
          if (!isBoolean(value)) {
            error[field] = `[ ${field} ], Expected boolean value. Value: ${value}`
          }
          return
        case 'date':
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            error[field] = `[ ${field} ], Expected date format. Value: ${value}`
          } else {
            obj[field] = toISOString(value)
          }
          return
        case 'number':
          const numberValue = toNumber(value.replace(/,/g, ''))
          if (!isNaN(numberValue)) {
            obj[field] = numberValue
          } else {
            error[field] = `[ ${field} ], Expected number format. Value: ${value}`
          }
          break
        default:
          break
      }

      if (config.is_required && isUndefined(value)) {
        error[field] = `[ ${field} ] cannot be null`
      }
    }
  })
  return {
    error,
    obj,
  }
}
