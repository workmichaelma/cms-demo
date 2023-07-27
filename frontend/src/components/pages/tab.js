import { useEffect, useMemo } from 'react'
import Block from './block'
import { find, isEmpty, map, set } from 'lodash'
import BlockItem from './block/item'

import Switcher from 'components/common/input/switcher'
import { GET_DISTINCT_FIELD } from 'utils/query'
import Table from 'components/pages/tabs/table'

export default function Tab({ subheader, data, collection, store }) {
  const { entity = {}, page = {} } = data || {}
  const { setInputs } = store
  const _id = entity?._id

  const rows = useMemo(() => {
    if (entity) {
      return entity['companies']
    }
    return []
  }, [entity])

  const setting = {
    collection: 'company',
    editable: true,
    deletable: true,
    addable: true,
    copyable: true,
    showPopup: true,
    prefix: 'company',
  }

  const schema = [
    {
      field: 'name',
      target_id: true,
      title: '公司簡稱',
      editable: false,
      free_solo: false,
      type: 'text',
      select: true,
      with_entities_options: {
        path: 'name_tc',
        variables: {
          collection: 'company',
        },
      },
    },
    {
      field: 'effective_date',
      title: '擁有日期',
      type: 'date',
    },
    {
      field: 'end_date',
      title: '售出日期',
      type: 'date',
    },
    {
      field: 'value',
      title: '價值',
      type: 'text',
    },
  ]
  useEffect(() => {
    setInputs((v) => {
      return set({ ...v }, 'relation', {
        ...v.relation,
        collection: setting.collection,
      })
    })
  }, [collection, setInputs])
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
