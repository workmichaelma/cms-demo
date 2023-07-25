import { isObject, isString } from 'lodash'
import React from 'react'
import { parseISODateString } from 'utils/input'

function Readonly({ value }) {
  let text = isObject(value) && value?.label ? value.label : value
  if (!isString(text)) return null
  return (
    <div className='flex items-center text-xl shrink-1 break-all'>
      {parseISODateString(text)}
    </div>
  )
}

export default Readonly
