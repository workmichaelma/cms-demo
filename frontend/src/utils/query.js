import { gql } from '@apollo/client'
export const PAGE_SCHEMA_FRAGMENT = gql`
  fragment PageSchemaFragment on Page {
    schema {
      field
      is_email
      is_multiple
      is_password
      is_phone
      title
      type
      select
      options
      placeholder
      is_required
      free_solo
      editable
      maxlength
      checkbox
    }
  }
`

export const GET_DISTINCT_FIELD = gql`
  query getDistinctField($collection: Collection!, $field: String) {
    entityDistinctField(collection: $collection, field: $field)
  }
`

export const ENTITY_BASIC = `
  _id
  status
  created_at
  updated_at
  created_by {
    display_name
  }
  updated_by {
    display_name
  }
`

export const RELATION_BASIC = `
  doc_id
  target_id
  effective_date
  end_date
`

export const ENTITY_UPDATE = gql`
  mutation UpdateEntity(
    $collection: Collection!
    $_id: ID!
    $body: EntityInput
  ) {
    updateEntity(collection: $collection, _id: $_id, body: $body)
  }
`

export const ENTITY_INSERT = gql`
  mutation InsertEntity($collection: Collection!, $body: EntityInput) {
    insertEntity(collection: $collection, body: $body)
  }
`

export const CURRENT_USER = gql`
  query Query {
    currentUser {
      _id
      username
      is_admin
      display_name
      permissions
      is_logged_in
    }
  }
`

export const LOGIN = gql`
  mutation Login($data: LoginInput!) {
    login(data: $data)
  }
`

export const DUMMY = gql`
  query Query {
    health
  }
`

export const GET_ENTITIES = gql`
  query getEntities($collection: Collection!, $filter: [ListingFilter]) {
    listing(collection: $collection, filter: $filter, pageSize: 10000000) {
      data {
        ... on CompanyListingResultData {
          _id
          name
          name_tc
        }
      }
    }
  }
`
