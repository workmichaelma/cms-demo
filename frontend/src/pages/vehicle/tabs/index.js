import { useInputStore } from 'hooks/use-input-store'
import General from './general'
import { useContext, useMemo } from 'react'
import PageTabs from 'components/pages/tabs'
import PageTab from 'components/pages/tabs/tab'
import Tab from 'components/pages/tab'

function Tabs(props) {
  const { tab, _id, prefix, data } = props
  const store = useInputStore({
    ...props,
    tab: data?.pageConfig?.tabs?.setting?.collection || tab,
    showSaveIcon: false,
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
        tabHeaders={data?.page?.pageConfig?.tabHeaders}
        prefix={prefix}
        _id={_id}
      />
      {Page}
    </div>
  )
}

export default Tabs
