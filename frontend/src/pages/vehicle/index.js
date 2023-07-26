import React, { useEffect } from 'react'

import withPage from 'hooks/with-page'
import QUERY from './query'

import Tabs from './tabs'
import Table from 'components/pages/listing/table'

// import Index from '../../components/pages/listing'
// import Profile from './profile'
// import Upload from './upload'

function Page({
  mode,
  _id,
  collection,
  prefix,
  title,
  sidebarItem,
  newEntry,
  isHome,
  isImport,
  isNew,
  isCopy,
  isEdit,
  tab,
  data,
  loading,
  refetch,
  setFilter,
  setSort,
}) {
  if (isHome)
    return (
      <Table
        prefix={prefix}
        data={data}
        loading={loading}
        refetch={refetch}
        setFilter={setFilter}
        setSort={setSort}
      />
    )
  if (isImport) return null
  if (isEdit || isNew || isCopy)
    return (
      <Tabs
        _id={_id}
        tab={tab}
        data={data}
        collection={collection}
        isNew={isNew}
        isCopy={isCopy}
        isEdit={isEdit}
        refetch={refetch}
      />
    )
  return <div>123</div>
}

export default withPage(Page, { QUERY })
