import * as React from 'react'
import Block from './block'
import { find, map } from 'lodash'
import BlockItem from './block/item'

import Switcher from 'components/common/input/switcher'
import { GET_DISTINCT_FIELD } from 'utils/query'

const fieldsToDisplay = [
  'status',
  'chassis_number',
  'color',
  'body_type',
  'car_loan',
  'in_charge',
  'print_number',
  'mvmd_remarks',
  'district',
  'usage',
  'purpose',
  'type',
  'type_detail',
  'make',
  'maintainance',
  'maintainance_remarks',
  'maintainance_end_date',
  'maintenance_mileage',
  'vehicle_class',
  'license',
  'vehicle_model',
  'engine_number',
  'cylinder_capacity',
  'gross_weight',
  'registered_owner',
  'owner_registration_date',
  'manufacture_year',
  'first_registration_date',
  'gratia_payment_scheme',
  'rearview_mirror',
  'spare_key',
  'new_car',
  'remarks',
]

export default function General({ data, collection, store }) {
  const { entity = [], page = {} } = data || {}
  const { setInputs, setInputErrors } = store
  return (
    <Block subheader='基本資料'>
      {map(fieldsToDisplay, (field) => {
        const schema = find(page?.schema, { field })
        const value = entity[field]
        if (!schema?.title) return null
        return (
          <BlockItem
            key={field}
            header={schema.title}
          >
            <Switcher
              schema={schema}
              setInputs={setInputs}
              setInputErrors={setInputErrors}
              value={value}
              field={field}
              metadata={{
                optionsQuery: {
                  query: GET_DISTINCT_FIELD,
                  params: {
                    collection,
                    field,
                  },
                  path: 'entityDistinctField',
                },
              }}
            />
          </BlockItem>
        )
      })}
      <BlockItem header='建立日期'>
        <div className='leading-10'>{entity.created_at}</div>
      </BlockItem>
      <BlockItem header='更新日期'>
        <div className='leading-10'>{entity.updated_at}</div>
      </BlockItem>
    </Block>
  )
}
