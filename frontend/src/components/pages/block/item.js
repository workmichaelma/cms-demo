import * as React from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'

export default function BlockItem({ header, children }) {
  return (
    <ListItem disablePadding>
      <div className='w-full py-2 px-4 flex gap-4 text-base'>
        <div className='w-40 shrink-0 leading-10'>{header}</div>
        <div className='grow'>{children}</div>
      </div>
    </ListItem>
  )
}
