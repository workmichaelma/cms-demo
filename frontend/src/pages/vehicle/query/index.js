import { gql } from '@apollo/client'

import { PAGE_SCHEMA_FRAGMENT, ENTITY_BASIC } from 'utils/query'

import TAB_QUERY from './tab'
import { upperCase } from 'lodash'

const GET_ENTITY = (tab) => {
  return TAB_QUERY[upperCase(tab)]
}

const GET_SCHEMA = gql`
  query getSchema($collection: Collection!) {
    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }

  ${PAGE_SCHEMA_FRAGMENT}
`

const GET_LISTING = gql`
  query getListing($collection: Collection!) {
    listing(collection: $collection) {
      data {
        ... on VehicleListingResultData {
          _id
          status
          reg_mark
          chassis_number
          print_number
          in_charge
          type
          purpose
          make
          vehicle_class
          license
          color
          manufacture_year
        }
      }
      metadata {
        page
        pageSize
        hasNextPage
        hasPrevPage
        totalPages
        total
        pipeline
      }
    }
    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }
  ${PAGE_SCHEMA_FRAGMENT}
`

export default {
  GET_ENTITY,
  GET_SCHEMA,
  GET_LISTING,
}
