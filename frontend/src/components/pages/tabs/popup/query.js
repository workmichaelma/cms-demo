import { gql } from '@apollo/client'

export const UPDATE_ENTITY = gql`
  mutation UpdateEntity(
    $collection: Collection!
    $id: ID!
    $body: EntityInput
  ) {
    updateEntity(collection: $collection, _id: $id, body: $body)
  }
`
