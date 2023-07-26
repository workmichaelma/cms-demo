import * as React from 'react'
import Tab from '@mui/material/Tab'

export default function PageTab({ label, href, prefix, _id, tab }) {
  return (
    <Tab
      label={label}
      component='a'
      href={href || `/admin/${prefix}/${_id}/${tab}`}
    />
  )
}
