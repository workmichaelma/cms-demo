import General from 'components/pages/general'
import { useEffect, useState } from 'react'

export default function GeneralPage({
  data,
  collection,
  isEdit,
  isCopy,
  isNew,
  store,
}) {
  return (
    <General
      data={data}
      collection={collection}
      store={store}
    />
  )
}
