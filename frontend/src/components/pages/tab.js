import { useEffect, useMemo } from 'react'
import Block from './block'

import Table from 'components/pages/tabs/table'
import { isEmpty, set } from 'lodash'

export default function Tab({ subheader, data, collection, store }) {
  const { entity = {} } = data || {}
  const _id = entity?._id
  const { setInputs } = store

  const { setting, schema } = data?.page?.pageConfig?.tab || {}

  const rows = useMemo(() => {
    if (entity) {
      return entity[setting?.path]
    }
    return []
  }, [entity, setting])

  useEffect(() => {
    setInputs((v) => {
      return set({ ...v }, 'relation', {
        ...v.relation,
        collection: setting?.collection,
      })
    })
  }, [setting, entity, setInputs])

  if (isEmpty(setting)) return null

  return (
    <Block subheader={subheader}>
      <Table
        rows={rows}
        schema={schema}
        setting={setting}
        _id={_id}
        store={store}
      />
    </Block>
  )
}
