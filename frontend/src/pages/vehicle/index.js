import React, { useEffect } from 'react'

import withPage from 'hooks/with-page'

import QUERY from './query'

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
}) {
  if (isHome) return null
  if (isImport) return null
  return <div>123</div>
}

export default withPage(Page, { QUERY })
