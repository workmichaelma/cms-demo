import { useAtom } from 'jotai'
import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import MuiAppBar from '@mui/material/AppBar'

import TopNav from 'components/common/top-bar'
import { sideBar } from 'global-store'
import SideMenu from 'components/common/sidemenu'
import Alert from 'components/common/alert'
import withAuth from 'hooks/with-auth'
const drawerWidth = 200

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
)

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Document = ({ children, loading }) => {
  const theme = useTheme()
  const [{ open }] = useAtom(sideBar)

  if (loading) return null
  return (
    <Box sx={{ display: 'flex', color: 'white' }}>
      <CssBaseline />
      <AppBar
        position='fixed'
        open={open}
        sx={{
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          borderBottom: '1px solid #eeeeee',
        }}
      >
        <TopNav />
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant='persistent'
        anchor='left'
        open={open}
      >
        <div className='bg-neutral-700 text-white min-h-full'>
          <SideMenu />
        </div>
      </Drawer>
      <Main
        open={open}
        sx={{ minHeight: '100vh', bgcolor: '#f5f6f9' }}
      >
        <Alert />
        <div className='mt-16' />
        <div className='text-sm text-zinc-900'>{children}</div>
      </Main>
    </Box>
  )
}

export default withAuth(Document)
