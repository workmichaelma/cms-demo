import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'

import { sideBar, topBar } from 'global-store'

export default function withPage(Page, PageProps) {
  return (props) => {
    const { collection, mode, prefix, sidebarItem, title, url, query } = props
    const { QUERY } = PageProps
    const [filter, setFilter] = useState([])
    const [sort, setSort] = useState({})
    const { _id, tab = 'general' } = useParams()
    const [_, setSideBar] = useAtom(sideBar)
    const [__, setTopBar] = useAtom(topBar)

    const isHome = mode === 'home'
    const isImport = mode === 'import'
    const isEdit = mode === 'edit'
    const isNew = mode === 'new'
    const isCopy = mode === 'copy'
    const isTab = mode === 'tab'

    const Query = isHome
      ? QUERY.GET_LISTING
      : isNew
      ? QUERY.GET_SCHEMA
      : QUERY.GET_ENTITY(tab)
    const { loading, error, data, refetch } = useQuery(Query, {
      variables: {
        collection: collection || prefix,
        _id,
        sort,
        filter,
      },
    })

    console.log(data)
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
        isTab={isTab}
        isEdit={isEdit}
        isNew={isNew}
        isCopy={isCopy}
        _id={_id}
        tab={tab}
        data={data}
        refetch={refetch}
        setFilter={setFilter}
        setSort={setSort}
        loading={loading}
      />
    )
  }
}
