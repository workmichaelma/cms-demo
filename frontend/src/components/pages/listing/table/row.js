import dayjs from 'dayjs'
import React from 'react'
import { endsWith, find, get, isBoolean, isEmpty } from 'lodash'
import { Done, Clear } from '@mui/icons-material'

import { isISODateString } from 'utils/input'
import To from 'components/common/to'

function Row({ prefix, record, cols, schema }) {
  return (
    <To
      className='flex gap-4 py-2 hover:bg-zinc-200 px-3 flex items-center even:bg-zinc-50'
      url={`/${prefix}/${record._id}`}
      key={record._id}
    >
      {cols.map((col) => {
        const _schema = schema[col.field]
        const showDollar = _schema?.show_dollar
        console.log(_schema)
        const v = record[col.field]
        const value = v
          ? isISODateString(v)
            ? dayjs(v).format('YYYY-MM-DD')
            : showDollar
            ? `$${v}`
            : v
          : col.type === 'boolean'
          ? v
          : ''
        return (
          <div
            className='w-20 grow text-left break-all'
            key={col.field}
          >
            {isBoolean(value) ? (
              value ? (
                <Done color='success' />
              ) : (
                <Clear color='warning' />
              )
            ) : (
              value || ''
            )}
          </div>
        )
      })}
    </To>
  )
}

export default Row
