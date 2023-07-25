import React, { useEffect } from 'react'

import withPage from 'hooks/with-page'
import QUERY from './query'

import Tabs from './tabs'

// import Index from '../../components/pages/listing'
// import Profile from './profile'
// import Upload from './upload'

function Page({
  mode,
  prefix,
  title,
  sidebarItem,
  newEntry,
  isHome,
  isImport,
  isTab,
  isNew,
  tab,
  data,
  refetch,
}) {
  if (isHome) return null
  if (isImport) return null
  if (isTab || isNew)
    return (
      <Tabs
        tab={tab}
        data={data}
      />
    )
  return <div>123</div>
}

export default withPage(Page, { QUERY })
