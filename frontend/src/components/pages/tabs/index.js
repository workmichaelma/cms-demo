import { useEffect, useMemo, useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Box from '@mui/material/Box'
import PageTab from './tab'
import { findIndex } from 'lodash'

export default function PageTabs({
  children,
  tabHeaders,
  prefix,
  _id,
  currentTab,
}) {
  const value = useMemo(() => {
    return findIndex(tabHeaders, { key: currentTab })
  }, [currentTab, tabHeaders])

  return (
    <Box>
      <Tabs
        value={value}
        scrollButtons='auto'
      >
        {(tabHeaders || []).map((tab) => {
          return (
            <PageTab
              label={tab.title}
              prefix={prefix}
              _id={_id}
              tab={tab.key}
            />
          )
        })}
        {children}
      </Tabs>
    </Box>
  )
}
