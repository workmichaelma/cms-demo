import React, { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { Alert, Snackbar } from '@mui/material'

import { alert as _alert } from 'global-store'

function AlertComponent() {
  const [active, setActive] = useState(false)
  const [alert] = useAtom(_alert)
  useEffect(() => {
    let timer = null
    if (alert?.message) {
      setActive(true)
      timer = setTimeout(() => {
        setActive(false)
      }, alert.timeout || 5000)
    }
    return () => clearTimeout(timer)
  }, [alert])

  if (!active) return null
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={active}
      autoHideDuration={5000}
    >
      <Alert
        severity={alert.type}
        sx={{
          width: '100%',
          minWidth: 300,
          textAlign: 'center',
          '.MuiAlert-message': { width: '100%' },
        }}
      >
        {alert.message}
      </Alert>
    </Snackbar>
  )
}

export default AlertComponent
