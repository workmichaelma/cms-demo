import React, { useEffect } from 'react'

import List from 'components/lists'

export default function Listing({ defaultSort }) {
  return (
    <List
      defaultSort={defaultSort}
      pageName='listing'
    />
  )
}
