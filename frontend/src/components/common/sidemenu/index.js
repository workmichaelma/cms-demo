import React from 'react'
import { MenuOpen } from '@mui/icons-material'
import { useAtom } from 'jotai'
import { sideBar } from 'global-store'

import Divider from '@mui/material/Divider'
import Items from './items'
import User from './user'

function SideMenu() {
  const [_, setSideBar] = useAtom(sideBar)
  return (
    <div className='bg-neutral-700 flex flex-col min-h-full justify-around align-center'>
      <div className='h-16'></div>
      <Divider sx={{ bgcolor: 'gray' }} />
      <User />
      <Divider sx={{ bgcolor: 'gray' }} />
      <div className='grow'>
        <Items />
      </div>
      <div className='flex justify-end p-2'>
        <MenuOpen
          sx={{ color: 'white', cursor: 'pointer', width: 28, height: 28 }}
          onClick={() => {
            setSideBar((v) => ({
              ...v,
              open: false,
            }))
          }}
        />
      </div>
    </div>
  )
}

export default SideMenu
