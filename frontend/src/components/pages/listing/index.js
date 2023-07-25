import React, { useEffect } from 'react'

import Table from './table'

export default function Listing({ defaultSort }) {
  return <Table defaultSort={defaultSort} />
}
