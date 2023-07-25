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
      placeholder
      is_required
    }
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
