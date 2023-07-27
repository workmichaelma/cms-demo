import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import { Autocomplete, TextField, InputAdornment } from '@mui/material'
import { isEmpty, isObject, isString, find, isFunction, set } from 'lodash'

import { getErrorMessage } from 'utils/input'
import { DUMMY } from 'utils/query'
import * as QUERIES from 'utils/query'

function InputSelect({
  name,
  value = '',
  schema,
  setInputs,
  setInputErrors,
  saveBtnClicked,
  metadata,
  events,
}) {
  const { options, free_solo = false, editable, placeholder } = schema
  const [text, setText] = useState(
    isString(value) ? { _id: value, label: value } : value || ''
  )
  const [touched, setTouched] = useState(false)

  const presetOptions = useMemo(() => {
    return metadata?.preset?.options || []
  }, [metadata])
  const preselectedOption = useMemo(() => {
    return metadata?.preset?.selected
  }, [metadata])

  const QUERY = useMemo(() => {
    return metadata?.optionsQuery?.query
  }, [metadata])
  const [getOptions, getOptionsResult] = useLazyQuery(QUERY || DUMMY)
  const _options = useMemo(() => {
    let arr = []
    if (!isEmpty(presetOptions)) {
      arr = presetOptions
    } else if (options) {
      arr = options
    } else {
      const { data, called } = getOptionsResult
      if (called && data) {
        arr = data[metadata?.optionsQuery.path]
      }
    }

    return arr.map((v) => {
      if (isObject(v)) {
        return v
      } else if (isString(v)) {
        return {
          _id: v,
          label: v,
        }
      }
      return {}
    })
  }, [options, getOptionsResult, presetOptions, metadata])

  const errorMessage = useMemo(() => {
    if (touched || saveBtnClicked) return getErrorMessage({ schema, text })
  }, [schema, text, touched, saveBtnClicked])

  useEffect(() => {
    if (!isEmpty(_options) && preselectedOption && !touched) {
      const option = find(_options, { _id: preselectedOption })
      if (option && option?._id) {
        setText(option._id)
      }
    }
  }, [_options, preselectedOption, touched])

  useEffect(() => {
    if (touched || saveBtnClicked) {
      const { _id = null } = text || {}

      const output = _id === value ? undefined : _id

      setInputs((v) => {
        return set({ ...v }, name, output)
      })
      setInputErrors((v) => {
        return set({ ...v }, name, errorMessage)
      })
      if (isFunction(events?.onChange)) {
        events.onChange(output)
      }
    }
  }, [
    text,
    errorMessage,
    name,
    setInputs,
    setInputErrors,
    value,
    touched,
    saveBtnClicked,
    events,
  ])

  return (
    <Autocomplete
      value={text}
      size='small'
      disablePortal
      disabled={editable === false}
      fullWidth
      freeSolo={free_solo}
      isOptionEqualToValue={(option, value) => {
        // console.log(option, value)
        return false
      }}
      options={_options}
      onOpen={() => {
        if (QUERY && isEmpty(_options) && !getOptionsResult.called) {
          getOptions({
            variables: {
              ...metadata?.optionsQuery?.params,
              ...schema?.optionsQuery?.params,
            },
          })
        } else if (
          metadata?.preset?.options === null &&
          isFunction(metadata?.preset?.getOptions)
        ) {
          metadata.preset.getOptions()
        }
      }}
      getOptionLabel={(v) => {
        return v.label || ''
      }}
      onChange={(e, v, reason) => {
        if (isObject(v) && v._id) {
          setText(v)
        } else {
          setText({ _id: v, label: v })
        }
        if (!touched) setTouched(true)
      }}
      onInputChange={(event, v = null, r) => {
        if ((r === 'input' && free_solo) || r === 'clear') {
          setText({ _id: v, label: v })
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
