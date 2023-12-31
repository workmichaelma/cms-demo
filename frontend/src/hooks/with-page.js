import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { useEffect, useMemo, useState, createContext, useContext } from 'react'
import { useQuery } from '@apollo/client'

import { sideBar, topBar } from 'global-store'

export default function withPage(Page, PageProps) {
  return (props) => {
    const { collection, mode, prefix, sidebarItem, title, url, query } = props
    const { QUERY } = PageProps
    const [filter, setFilter] = useState([])
    const [sort, setSort] = useState({})
    const [page, setPage] = useState(1)
    const { _id, tab = 'general' } = useParams()
    const [_, setSideBar] = useAtom(sideBar)
    const [__, setTopBar] = useAtom(topBar)

    const isHome = mode === 'home'
    const isImport = mode === 'import'
    const isEdit = mode === 'edit'
    const isNew = mode === 'new'
    const isCopy = mode === 'copy'

    const Query = isHome
      ? QUERY.GET_LISTING
      : isNew
      ? QUERY.GET_SCHEMA
      : QUERY.GET_ENTITY(tab)
    const { loading, error, data, refetch } = useQuery(Query, {
      fetchPolicy: 'no-cache',
      variables: {
        collection: collection || prefix,
        _id,
        sort,
        filter,
        page: isNew || isCopy || isEdit ? 'profile' : isHome ? page : '',
        tab: isHome ? undefined : isCopy || isNew ? 'general' : tab,
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
        collection={collection || prefix}
        isHome={isHome}
        isImport={isImport}
        isEdit={isEdit}
        isNew={isNew}
        isCopy={isCopy}
        _id={_id}
        tab={tab}
        data={data}
        refetch={refetch}
        page={page}
        setFilter={setFilter}
        setSort={setSort}
        setPage={setPage}
        loading={loading}
      />
    )
  }
}
