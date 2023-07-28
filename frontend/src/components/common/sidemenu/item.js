import { useEffect, useState } from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useAtom } from 'jotai'
import { map } from 'lodash'

import { sideBar } from 'global-store'
import { redirect } from 'utils'

const Bar = ({ item, onClick, open, activeItem }) => {
  const hasChild = item?.children
  const selected = activeItem === item.key
  return (
    <ListItemButton
      selected={hasChild && open ? false : selected}
      onClick={() => onClick(item?.url)}
      sx={{
        pl: !hasChild && !item.isRoot ? '24px' : '16px',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 'auto',
          paddingRight: '8px',
          color: 'white',
        }}
      >
        {item.icon}
      </ListItemIcon>
      <ListItemText
        primary={item.name}
        sx={{ '.MuiTypography-root': { fontSize: '14px' } }}
      />
      {hasChild ? open ? <ExpandLess /> : <ExpandMore /> : null}
    </ListItemButton>
  )
}

export default function Item({ item }) {
  const [{ activeItem = [] }] = useAtom(sideBar)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const childrenKeys = map(item?.children, (item) => item.key)
    setOpen(activeItem[0] === item.key || childrenKeys.includes(activeItem[1]))
  }, [activeItem, item])

  const handleClick = (url) => {
    if (url) {
      redirect({ url })
    } else {
      setOpen(!open)
    }
  }

  return (
    <div className=''>
      <Bar
        onClick={handleClick}
        item={item}
        open={open}
        activeItem={activeItem[0]}
      />
      {item?.children && (
        <Collapse
          in={open}
          timeout='auto'
          unmountOnExit
        >
          <List
            component='div'
            disablePadding
          >
            {item.children.map((child) => (
              <Bar
                key={child.name}
                activeItem={activeItem[1]}
                onClick={handleClick}
                item={{
                  icon: item.icon,
                  ...child,
                }}
              />
            ))}
          </List>
        </Collapse>
      )}
    </div>
  )
}
