import * as React from 'react'
import Block from './block'
import { find, map } from 'lodash'
import BlockItem from './block/item'

import Switcher from 'components/common/input/switcher'

export default function General({ data, setInputs, setInputErrors }) {
  const { entity = [], page = {} } = data || {}
  return (
    <Block subheader='基本資料'>
      {map(entity, (value, field) => {
        const schema = find(page?.schema, { field }) || {}
        const { title } = schema
        if (!title) return null
        return (
          <BlockItem
            key={field}
            header={title}
          >
            <Switcher
              schema={schema}
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
