import { TextField, OutlinedInput } from '@mui/material'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import IconButton from '@mui/material/IconButton'
import { useFormControl, InputAdornment } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { isEmpty, isNull, isString, isUndefined } from 'lodash'
import { getErrorMessage } from 'utils/input'

function InputText({
  setInputs,
  setInputErrors,
  name,
  value,
  schema,
  saveBtnClicked,
  customErrorHandler,
}) {
  const {
    type,
    placeholder,
    is_required = false,
    is_password = false,
    editable,
    disabled,
    maxlength,
  } = schema
  const [showPassword, setShowPassword] = useState(is_password)
  const [touched, setTouched] = useState(false)
  const [text, setText] = useState(!isUndefined(value) ? value : '')
  const ref = useRef()

  const errorMessage = useMemo(() => {
    if (customErrorHandler && text && touched) {
      return customErrorHandler(text)
    }
    return getErrorMessage({ schema, text })
  }, [schema, text, touched, customErrorHandler])

  // useEffect(() => {
  //   if (touched) {
  //     ref.current.touched = true
  //   }
  // }, [touched])

  // useEffect(() => {
  //   setInputs((v) => {
  //     return {
  //       ...v,
  //       [name]: ref,
  //     }
  //   })
  // }, [name, setInputs])

  useEffect(() => {
    setInputs((v) => ({
      ...v,
      [name]: value === text ? undefined : text,
    }))
    setInputErrors((v) => ({
      ...v,
      [name]: errorMessage,
    }))
  }, [value, text, name, setInputs, setInputErrors, schema, errorMessage])

  if (!schema) return null
  return (
    <TextField
      type={!is_password ? 'text' : showPassword ? 'password' : 'text'}
      inputRef={ref}
      onChange={(e) => {
        const v = e.target.value
        setText(v)
        setTouched(true)
      }}
      fullWidth
      multiline={type === 'textarea'}
      size='small'
      name={name}
      value={text}
      rows={5}
      inputProps={{ maxLength: maxlength }}
      disabled={(value && editable === false) || disabled}
      InputProps={{
        endAdornment: is_password ? (
          <InputAdornment position='end'>
            {is_required && editable ? (
              <InputAdornment position='start'>必填</InputAdornment>
            ) : null}
            <IconButton
              aria-label='toggle password visibility'
              onClick={() => {
                setShowPassword((v) => {
                  return !v
                })
              }}
              onMouseDown={() => {
                setShowPassword((v) => {
                  return !v
                })
              }}
              edge='end'
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : is_required && editable ? (
          <InputAdornment position='start'>必填</InputAdornment>
        ) : null,
      }}
      error={!!errorMessage}
      helperText={errorMessage}
      placeholder={placeholder}
      sx={{
        '.MuiFormHelperText-root': {
          display: !touched && !saveBtnClicked ? 'none' : 'inherit',
        },
        '.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor:
            !touched && !saveBtnClicked
              ? 'rgba(0, 0, 0, 0.23) !important'
              : '#d32f2f',
        },
      }}
    />
  )
}

export default InputText
