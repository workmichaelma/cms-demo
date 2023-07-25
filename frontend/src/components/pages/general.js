import * as React from 'react'
import Block from './block'
import { find, map } from 'lodash'
import BlockItem from './block/item'

import Switcher from 'components/common/input/switcher'

export default function General({ data, setInputs, setInputErrors }) {
  const { entity = [], page = {} } = data || {}
  const { schema } = page || {}
  return (
    <Block subheader='基本資料'>
      {map(schema, (row) => {
        const { field, title } = row
        const value = entity[field]
        if (!title) return null
        return (
          <BlockItem
            key={field}
            header={title}
          >
            <Switcher
              schema={row}
              setInputs={setInputs}
              setInputErrors={setInputErrors}
              value={value}
              field={field}
            />
          </BlockItem>
        )
      })}
    </Block>
  )
}
