import { useLazyQuery } from '@apollo/client'
import { map } from 'lodash'
import { useMemo } from 'react'

import { GET_ENTITIES } from 'utils/query'

import Select from './select'

export default function SelectWithEntitiesOptions(props) {
  const { metadata, schema } = props

  const { with_entities_options } = schema
  const [getOptions, getOptionsResult] = useLazyQuery(GET_ENTITIES)

  const options = useMemo(() => {
    const { data, called } = getOptionsResult

    console.log(schema?.field, data?.listing?.data)

    if (!called) return null
    if (data && called) {
      return map(data?.listing?.data, (row) => ({
        _id: row._id,
        label: row[with_entities_options?.path || schema?.field],
      }))
    }
    return null
  }, [getOptionsResult, schema, with_entities_options])

  return (
    <Select
      {...props}
      metadata={{
        ...metadata,
        preset: {
          options,
          getOptions: () => {
            getOptions({
              variables: with_entities_options?.variables || {},
            })
          },
        },
      }}
    />
  )
}
