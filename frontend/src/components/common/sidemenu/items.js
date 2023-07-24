import { List } from '@mui/material'
import Item from './item'
import { items } from './config'

export default function MenuItems() {
  return (
    <List
      sx={{
        '.MuiListItemButton-root.Mui-selected': {
          backgroundColor: 'rgb(113,113,122)',
        },
        '.MuiListItemButton-root:hover': {
          backgroundColor: 'rgb(113,113,122)',
        },
      }}
    >
      {items.map((item) => (
        <Item item={item} />
      ))}
    </List>
  )
}
