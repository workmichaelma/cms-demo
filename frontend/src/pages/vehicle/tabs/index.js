import { useInputStore } from 'hooks/use-input-store'
import General from './general'
import { useMemo } from 'react'
import PageTabs from 'components/pages/tabs'
import PageTab from 'components/pages/tabs/tab'
import Tab from 'components/pages/tab'

function Tabs(props) {
  const { tab, _id, prefix } = props
  const store = useInputStore({ ...props })

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
      <PageTabs>
        <PageTab
          label='基本資料'
          prefix={prefix}
          _id={_id}
          tab=''
        />
        <PageTab
          label='擁有公司'
          prefix={prefix}
          _id={_id}
          tab='company'
        />
      </PageTabs>
      {Page}
    </div>
  )
}

export default Tabs
