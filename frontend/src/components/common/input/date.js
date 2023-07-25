import React, { useEffect, useMemo, useState, useRef } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TextField } from '@mui/material'
import dayjs from 'dayjs'

import { getErrorMessage } from 'utils/input'
function InputDate({
  name,
  value,
  schema,
  options,
  setInputs,
  saveBtnClicked,
}) {
  const { is_required = false, editable = true } = schema
  const [text, setText] = useState(value ? dayjs(value) : undefined)
  const [touched, setTouched] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const day = dayjs(text)
    if (touched) {
      ref.current.touched = true
      if (day.isValid()) {
        ref.current.customValue = day.toISOString()
      } else {
        ref.current.customValue = null
      }
    } else {
      ref.current.customValue = value || null
    }
  }, [text, touched])

  useEffect(() => {
    setInputs((v) => {
      return {
        ...v,
        [name]: ref,
      }
    })
  }, [name, setInputs])

  return (
    <DatePicker
      clearable
      inputRef={ref}
      value={text}
      format='YYYY-MM-DD'
      disabled={!!value && !editable}
      slotProps={{
        actionBar: { actions: ['clear', 'today'] },
      }}
      sx={{
        '.MuiOutlinedInput-root': {
          height: '40px',
        },
      }}
      onChange={(v) => {
        setText(v)
        setTouched(true)
      }}
    />
  )
}

export default InputDate
