import { Logout, Person } from '@mui/icons-material'
import { useAtom } from 'jotai'

import { username } from 'global-store'

export default function MenuItems() {
  const [name] = useAtom(username)
  return (
    <div className='px-4 py-3 flex gap-2'>
      <Person sx={{ width: '20px' }} />
      <div className='grow'>{name}</div>
      <div className=''>
        <Logout sx={{ width: '16px' }} />
      </div>
    </div>
  )
}
