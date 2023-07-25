import { MuiFileInput } from 'mui-file-input'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useFormControl, InputAdornment } from '@mui/material'
import { DeleteForever } from '@mui/icons-material'
import { isEmpty, isNull } from 'lodash'

import { getErrorMessage } from 'utils/input'
import To from '../to'

const domain =
  process.env.NODE_ENV === 'development' ? 'http://localhost:8002/' : '/'
function InputFile({
  name,
  value = '',
  schema,
  options,
  suggestEndpoint,
  setInputs,
  saveBtnClicked,
}) {
  const { is_required = false, editable, placeholder } = schema
  const [touched, setTouched] = useState(false)
  const ref = useRef()

  const [file, setFile] = useState(null)

  useEffect(() => {
    setInputs((v) => {
      return {
        ...v,
        [name]: ref,
      }
    })
  }, [name, setInputs])

  useEffect(() => {
    if (touched) {
      ref.current.customValue = file
      ref.current.touched = true
    }
  }, [file, touched])

  return (
    <div className='flex flex-col gap-4 w-full'>
      <MuiFileInput
        inputRef={ref}
        onChange={(newFile) => {
          setFile(newFile)
          setTouched(true)
        }}
        fullWidth
        size='small'
        name={name}
        value={file}
        placeholder={placeholder}
        accept='.jpg,.jpeg,.png'
        sx={{
          label: {
            width: '100%',
          },
        }}
      />

      {value?.mimetype === 'image/png' ? (
        <Image
          value={value}
          file={file}
          touched={touched}
          setFile={setFile}
          setTouched={setTouched}
        />
      ) : null}
    </div>
  )
}

function convertFileSize(sizeInBytes) {
  if (!sizeInBytes) return ''
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = sizeInBytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return size.toFixed(2) + ' ' + units[unitIndex]
}

const Image = ({ value, file, touched, setFile, setTouched }) => {
  const image = !touched ? value : file
  if (!image) return null
  const src = `${domain}file/${image.name}`
  return (
    <To
      className='flex flex-col items-center max-w-[200px] relative'
      url={src}
      toNew
      withoutDomain
    >
      <div
        className='absolute top-0 right-0 bg-zinc-200/50 rounded'
        onClick={(e) => {
          e.preventDefault()
          setTouched(true)
          setFile(null)
        }}
      >
        <DeleteForever />
      </div>
      <img
        src={src}
        alt='preview'
      />
      <div className=''>
        {image.name} - {convertFileSize(image.size)}
      </div>
    </To>
  )
}

export default InputFile
