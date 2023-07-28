import { gql } from '@apollo/client'

import { PAGE_SCHEMA_FRAGMENT, ENTITY_BASIC, SCHEMA } from 'utils/query'

import TAB_QUERY from './tab'

const GET_ENTITY = (tab) => {
  return TAB_QUERY[tab.replace('_', '_').toUpperCase()]
}

const GET_SCHEMA = gql`
  query getSchema($collection: Collection!, $tab: String, $page: Int) {
    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }

  ${PAGE_SCHEMA_FRAGMENT}
`

const GET_LISTING = gql`
  query getListing($collection: Collection!, $page: Int) {
    listing(collection: $collection, page: $page) {
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
      fieldsToDisplay
      schema {
        ${SCHEMA}
      }
    }
  }
`

export default {
  GET_ENTITY,
  GET_SCHEMA,
  GET_LISTING,
}
