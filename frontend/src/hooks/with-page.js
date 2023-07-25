import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { useQuery } from '@apollo/client'

import { sideBar, topBar } from 'global-store'

export default function withPage(Page, PageProps) {
  return (props) => {
    const { collection, mode, prefix, sidebarItem, title, url, query } = props
    const { QUERY } = PageProps
    const { _id, tab } = useParams()
    const [_, setSideBar] = useAtom(sideBar)
    const [__, setTopBar] = useAtom(topBar)

    const isHome = mode === 'home'
    const isImport = mode === 'import'

    const Query = isHome ? QUERY.GET_LISTING : QUERY.GET_ENTITY
    const { loading, error, data, refetch } = useQuery(Query, {
      variables: {
        collection: collection || prefix,
        _id,
      },
    })

    console.log(data)

    useEffect(() => {}, [isHome])

    useEffect(() => {
      setTopBar((v) => ({
        ...v,
        title: title || prefix,
        url: url || `/${prefix}`,
      }))
    }, [prefix, title, setTopBar, url])

    useEffect(() => {
      setSideBar((v) => ({
        ...v,
        activeItem: sidebarItem,
      }))
    }, [sidebarItem, setSideBar])

    return (
      <Page
        {...props}
        isHome={isHome}
        isImport={isImport}
        _id={_id}
        tab={tab}
        data={data}
        refetch={refetch}
        loading={loading}
      />
    )
  }
}
