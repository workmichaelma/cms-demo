import { useQuery } from '@apollo/client'
import { useAtom } from 'jotai'
import { useLocation } from 'react-router-dom'

import { CURRENT_USER } from 'utils/query'
import { redirect } from 'utils'
import { username } from 'global-store'

export default function withAuth(Page) {
  return (props) => {
    const location = useLocation()
    const [_, setUsername] = useAtom(username)
    const currentPath = location.pathname

    const { loading, data } = useQuery(CURRENT_USER)

    if (!loading && data) {
      if (!data?.currentUser?.is_logged_in) {
        redirect({
          url: `/login?redirectPath=${encodeURIComponent(currentPath)}`,
        })
      } else if (data?.currentUser) {
        const { username, display_name } = data?.currentUser || {}
        setUsername(display_name || username)
      }
    }
    return (
      <Page
        {...props}
        loading={loading || !data}
      />
    )
  }
}
