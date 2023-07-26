import React, { useEffect, useMemo, useState, useRef, isNull } from 'react'
import { Switch } from '@mui/material'

function InputSwitch({ name, value, setInputs, saveBtnClicked }) {
  const [isOn, setIsOn] = useState(value === true || value === 'true')
  const [touched, setTouched] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (touched) {
      setInputs((v) => {
        return {
          ...v,
          [name]: isOn === value ? undefined : isOn,
        }
      })
    }
  }, [name, setInputs, touched, isOn, value])

  return (
    <Switch
      inputRef={ref}
      checked={isOn}
      onChange={(e) => {
        const on = e.target.checked
        setIsOn(on)
        if (!touched) {
          setTouched(true)
        }
      }}
    />
  )
}

export default InputSwitch
