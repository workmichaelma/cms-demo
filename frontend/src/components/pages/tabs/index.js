import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Box from '@mui/material/Box'

export default function PageTabs({ children }) {
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        scrollButtons='auto'
      >
        {children}
      </Tabs>
    </Box>
  )
}
