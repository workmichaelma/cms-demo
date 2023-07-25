import React, { isValidElement } from 'react'
import { IconButton, Button, Icon } from '@mui/material'
// import { useGlobalStore } from '../../lib/store'
import { useAtom } from 'jotai'
import { topBar, isCopyPage as _isCopyPage, sideBar } from 'global-store'
import {
  Add,
  Save,
  NavigateBefore,
  Upload,
  ContentCopy,
  Menu,
} from '@mui/icons-material'
import { useLocation } from 'react-router-dom'
import To from './to'
import { isFunction } from 'lodash'

function TopNav() {
  return <DefaultTopNav />
  // const { topnav } = useGlobalStore()
  // return (
  // 	<div className='fixed pl-[280px] z-50 h-14 top-0 left-0 w-full bg-zinc-50 flex items-center border-b'>
  // 		<div className='w-full px-5'>
  // 			{topnav ? (
  // 				isValidElement(topnav) ? (
  // 					topnav
  // 				) : (
  // 					<DefaultTopNav {...topnav} />
  // 				)
  // 			) : null}
  // 		</div>
  // 	</div>
  // )
}

const DefaultTopNav = ({}) => {
  const [{ url, title, save, saveable, copyable, createable }] = useAtom(topBar)
  const [{ open: sideBarOpen }, setSideBar] = useAtom(sideBar)
  const [isCopyPage] = useAtom(_isCopyPage)
  const location = useLocation()
  const currentPath = location.pathname
  return (
    <div className='h-16 flex items-center text-zinc-900'>
      {!sideBarOpen && (
        <div className='pl-2'>
          <IconButton
            onClick={() =>
              setSideBar((v) => {
                return { ...v, open: true }
              })
            }
          >
            <Menu />
          </IconButton>
        </div>
      )}
      {url && url !== currentPath && (
        <div className='px-2'>
          <To url={url}>
            <IconButton>
              <NavigateBefore />
            </IconButton>
          </To>
        </div>
      )}
      <div className='text-lg capitalize mx-4'>
        {isCopyPage ? 'Renew ' : null}
        {title}
      </div>
      <div className='grow flex justify-end gap-4'>
        {/* {upload ? (
					<div>
						<To url={upload}>
							<Button variant='contained' startIcon={<Upload />}>
								Import CSV
							</Button>
						</To>
					</div>
				) : null} */}
        {/* {copy ? (
					<div>
						<To url={copy}>
							<Button variant='contained' startIcon={<ContentCopy />}>
								Renew
							</Button>
						</To>
					</div>
				) : null} */}
        {createable ? (
          <div>
            <To url={`${url}/new`}>
              <Button
                variant='contained'
                startIcon={<Add />}
              >
                新記錄
              </Button>
            </To>
          </div>
        ) : null}
        {isFunction(save) ? (
          <div>
            <IconButton
              aria-label='save'
              onClick={() => save()}
              disabled={!saveable}
            >
              <Save color={saveable ? 'primary' : ''} />
            </IconButton>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default TopNav
