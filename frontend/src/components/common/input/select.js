import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Autocomplete, TextField, InputAdornment } from '@mui/material'
import {
  compact,
  isEmpty,
  isObject,
  isString,
  reduce,
  find,
  isFunction,
} from 'lodash'

import { getErrorMessage } from 'utils/input'
// import { useGet } from 'lib/request'

function InputSelect({
  name,
  value = '',
  schema,
  options,
  suggestEndpoint,
  setInputs,
  saveBtnClicked,
  metadata,
  events,
}) {
  const {
    is_required = false,
    select,
    free_solo = false,
    editable,
    placeholder,
  } = schema
  const [text, setText] = useState(value || '')
  const [touched, setTouched] = useState(false)
  const ref = useRef()

  // const { result = null, getRequest } = useGet()
  const presetOptions = useMemo(() => {
    return metadata?.preset?.options || []
  }, [metadata])

  const _options = useMemo(() => {
    if (!isEmpty(presetOptions)) return presetOptions
    // const arr = !isEmpty(select)
    //   ? select
    //   : result !== null && !isEmpty(result) && !isEmpty(result?.data)
    //   ? result.data
    //   : []

    // return compact(
    //   reduce(
    //     arr,
    //     (obj, v, k) => {
    //       if (v) {
    //         if (isString(v)) {
    //           obj.push({
    //             _id: v,
    //             label: v,
    //           })
    //         } else if (isObject(v)) {
    //           obj.push(v)
    //         }
    //       }
    //       return obj
    //     },
    //     []
    //   )
    // )
  }, [select, presetOptions])

  useEffect(() => {
    setInputs((v) => {
      return {
        ...v,
        [name]: ref,
      }
    })
  }, [name, setInputs])

  const preselectedOption = useMemo(() => {
    return metadata?.preset?.selected
  }, [metadata])
  useEffect(() => {
    if (!isEmpty(_options) && preselectedOption && !touched) {
      const option = find(_options, { _id: preselectedOption })
      if (option && option?._id) {
        setText(option._id)
      }
    }
  }, [_options, preselectedOption, touched])

  // useEffect(() => {
  //   if (
  //     isEmpty(presetOptions) &&
  //     preselectedOption &&
  //     isEmpty(_options) &&
  //     result === null &&
  //     suggestEndpoint
  //   ) {
  //     getRequest({ url: suggestEndpoint })
  //   }
  // }, [preselectedOption, _options, result, suggestEndpoint, presetOptions])

  useEffect(() => {
    const v = text
    let customValue = undefined
    ref.current.touched = touched
    if (!touched) {
      if (isString(value)) {
        customValue = value
      }
    } else {
      if (isObject(v) && v?._id) {
        customValue = v._id
      } else if (isString(v)) {
        customValue = v
      }
    }
    ref.current.customValue = customValue
    if (isFunction(events?.onChange)) {
      events.onChange(ref.current.customValue)
    }
  }, [text, value, touched, events])

  return (
    <Autocomplete
      value={text}
      size='small'
      disablePortal
      disabled={editable === false}
      fullWidth
      freeSolo={free_solo}
      options={free_solo ? _options : ['', ..._options]}
      onOpen={() => {
        // if (isEmpty(_options) && result === null && suggestEndpoint) {
        //   getRequest({ url: suggestEndpoint })
        // }
      }}
      getOptionLabel={(v) => {
        if (isObject(v) && v.label) {
          return v.label
        } else if (isString(v)) {
          const option = find(_options, { _id: v })
          if (option) {
            return option.label
          }
          return v
        }
        return ''
      }}
      onChange={(e, v, reason) => {
        if (isObject(v) && v.value) {
          setText(v.value)
        } else {
          setText(v)
        }
        if (!touched) setTouched(true)
      }}
      onInputChange={(event, v, r) => {
        if ((r === 'input' && free_solo) || r === 'clear') {
          setText(v)
        }
        if (!touched) setTouched(true)
      }}
      renderInput={(params) => {
        const errorMessage = getErrorMessage({
          schema,
          text: params.inputProps.value,
        })

        return (
          <TextField
            {...params}
            error={!!errorMessage}
            helperText={errorMessage}
            placeholder={placeholder}
            inputRef={ref}
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
      }}
    />
  )
}

export default InputSelect
