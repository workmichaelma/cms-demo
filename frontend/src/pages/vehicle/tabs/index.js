import { useInputStore } from 'hooks/use-input-store'
import General from './general'
import { useContext, useMemo } from 'react'
import PageTabs from 'components/pages/tabs'
import PageTab from 'components/pages/tabs/tab'
import Tab from 'components/pages/tab'
import { find } from 'lodash'

function Tabs(props) {
  const { tab, _id, prefix, data, isEdit } = props
  const store = useInputStore({
    ...props,
    data: data?.entity,
    schema: data?.page?.schema,
    tab: data?.pageConfig?.tabs?.setting?.collection || tab,
    showSaveIcon: tab === 'general',
  })

  const Page = useMemo(() => {
    if (tab === 'general') {
      return (
        <General
          {...props}
          store={store}
        />
      )
    } else {
      return (
        <Tab
          {...props}
          store={store}
        />
      )
    }
  }, [tab, store, props])

  return (
    <div className=''>
      <PageTabs
        currentTab={tab}
        tabHeaders={
          isEdit
            ? data?.page?.pageConfig?.tabHeaders
            : [find(data?.page?.pageConfig?.tabHeaders, { key: 'general' })]
        }
        prefix={prefix}
        _id={_id}
      />
      {Page}
    </div>
  )
}

export default Tabs
