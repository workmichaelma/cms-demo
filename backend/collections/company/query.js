export const query = `#graphql

  input CompanyInput {
    short_name: String
    name: String
    name_tc: String
    reg_number: String
    contact_number: String
    address: String
    email: String
    remarks: String
    status: Boolean
  }

  extend enum Collection {
    company
  }

  extend input EntityInput {
    company: CompanyInput
  }

  extend union Entity = Company

  type Company {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    short_name: String
    name: String
    name_tc: String
    reg_number: String
    contact_number: String
    address: String
    email: String
    remarks: String
    sign_image: ID
    chop_image: ID
    logo_image: ID
  }
`
