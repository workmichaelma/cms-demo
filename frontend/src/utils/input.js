import { isEmpty } from 'lodash'
import dayjs from 'dayjs'

export const getErrorMessage = ({ schema, text }) => {
  const {
    regExp,
    is_required = false,
    is_email,
    is_phone,
    is_number_only,
    is_positive,
    is_short_date,
  } = schema
  let message = null

  if (is_required && isEmpty(text)) {
    message = '此欄位不能為空'
  }

  if (text !== null && text !== '' && typeof text !== 'undefined') {
    if (is_email && !/^\S+@\S+\.\S+$/.test(text)) {
      message = '請輸入正確電郵'
    }

    if (is_phone && !/^[1-9]\d{7}$/.test(text)) {
      message = '請輸入正確電話號碼'
    }

    if (is_number_only && !/^[-]?\d+(\.\d+)?$/.test(text)) {
      message = '請輸入數字'

      if (!message && is_positive && !/^\d+(\.\d+)?$/.test(text)) {
        message = '請輸入正數'
      }
    }

    if (is_short_date && !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      message = '請輸入有效日期'
    }
    if (regExp && !isEmpty(regExp)) {
      const test = new RegExp(regExp)

      if (!test.test(text)) {
        message = '請輸入正確格式'
      }
    }
  }

  return message
}

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

export const parseISODateString = (str) => {
  try {
    if (isISODateString(str)) {
      const day = dayjs(str)
      if (day.isValid()) {
        return day.format('YYYY-MM-DD')
      }
    }
    return str
  } catch (err) {
    return str
  }
}
