import { map } from 'lodash'
import Switcher from 'components/common/input/switcher'
import BlockItem from 'components/pages/block/item'
import { useEffect } from 'react'

const Content = ({ schema, row, store }) => {
  const { setInputs, setInputErrors } = store
  return (
    <div className='flex flex-col gap-4 p-4'>
      {map(schema, (item) => {
        return (
          <BlockItem
            className='w-24'
            key={item.field}
            header={item.title}
          >
            <Switcher
              schema={item}
              setInputs={setInputs}
              setInputErrors={setInputErrors}
              value={row[item.field]}
              name={`relation.${item.field}`}
              // metadata={{
              //   optionsQuery: {
              //     query: GET_DISTINCT_FIELD,
              //     params: {
              //       collection,
              //       field,
              //     },
              //     path: 'entityDistinctField',
              //   },
              // }}
            />
          </BlockItem>
        )
      })}
    </div>
  )
}

export default Content
