import React from 'react'

import Text from './text'
import File from './file'
import Select from './select'
import Date from './date'
import Switch from './switch'
import Checkbox from './checkbox'
import { isArray, isEmpty } from 'lodash'

import { Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import Readonly from './readonly'

const AddNew = ({ title, pushItemToField, field }) => {
  return (
    <div className='flex'>
      <Button
        size='small'
        variant='contained'
        startIcon={<Add />}
        onClick={() => {
          pushItemToField(field)
        }}
      >
        新增 {title}
      </Button>
    </div>
  )
}

const switcher = (schema, name, metadata) => {
  let Component = null
  switch (schema?.type) {
    case 'readonly':
      Component = <Readonly />
      break
    case 'text':
    case 'textarea':
    case 'number':
      if (schema?.checkbox) {
        Component = <Checkbox name={name} />
      } else if (schema?.select) {
        Component = <Select name={name} />
      } else {
        Component = <Text name={name} />
      }
      break
    // case 'upload':
    //   Component = <File name={name} />;
    //   break;
    case 'date':
      Component = <Date name={name} />
      break
    case 'boolean':
      Component = <Switch name={name} />
      break
    // case 'relation':
    //   if (schema?.foreign === 'file') {
    //     Component = <File name={name} />;
    //   }
    //   break;
    default:
  }
  return Component
}

function InputSwitcher({ schema, ...props }) {
  let Component = null
  const { value, field, pushItemToField, ..._props } = props
  if (schema?.is_multiple && !schema?.checkbox) {
    const items = !value || isEmpty(value) ? [null] : value
    Component = (
      <div className='flex flex-col gap-2 w-full items-end'>
        {items.map((item, index) => {
          const key = `${field}.${index}`
          const Component = switcher(schema, key, {
            suggestEndpoint: props.suggestEndpoint,
          })
          return React.cloneElement(Component, {
            ..._props,
            schema,
            value: item,
            key,
          })
        })}
        <AddNew
          title={schema.title}
          pushItemToField={pushItemToField}
          field={`${field}.${value ? value.length : '0'}`}
        />
      </div>
    )
  } else {
    Component = switcher(schema, field)
  }
  if (!Component) return null
  return (
    // <WithLabel label={schema.title}>
    React.cloneElement(Component, { schema, value, ..._props })
    // </WithLabel>
  )
}

export default InputSwitcher
