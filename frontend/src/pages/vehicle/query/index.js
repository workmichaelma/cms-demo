import { gql } from '@apollo/client'

import { PAGE_SCHEMA_FRAGMENT, ENTITY_BASIC } from 'utils/query'

const GET_ENTITY = gql`
  query getEntityById($collection: Collection!, $_id: ID!) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        chassis_number
        color
        body_type
        car_loan
        in_charge
        print_number
        mvmd_remarks
        district
        usage
        purpose
        type
        type_detail
        make
        maintainance
        maintainance_remarks
        maintainance_end_date
        maintenance_mileage
        vehicle_class
        license
        vehicle_model
        engine_number
        cylinder_capacity
        gross_weight
        registered_owner
        owner_registration_date
        manufacture_year
        first_registration_date
        gratia_payment_scheme
        rearview_mirror
        spare_key
        new_car
        remarks
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }

  ${PAGE_SCHEMA_FRAGMENT}
`

const GET_LISTING = gql`
  query getListing($collection: Collection!) {
    listing(collection: $collection) {
      ... on Vehicle {
        _id
      }
    }
  }
`

export default {
  GET_ENTITY,
  GET_LISTING,
}
