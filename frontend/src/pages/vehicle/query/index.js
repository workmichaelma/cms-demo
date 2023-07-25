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
      ... on Vehicle {
        _id
      }
    }
  }
`

export default {
  GET_ENTITY,
  GET_SCHEMA,
  GET_LISTING,
}
