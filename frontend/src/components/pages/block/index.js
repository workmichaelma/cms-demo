import * as React from 'react'
import ListSubheader from '@mui/material/ListSubheader'
import List from '@mui/material/List'

export default function Block({ subheader, children }) {
  return (
    <List
      sx={{ width: '100%', bgcolor: 'background.paper' }}
      component='nav'
      subheader={<ListSubheader component='div'>{subheader}</ListSubheader>}
    >
      {children}
    </List>
  )
}
