export const query = `#graphql

  extend enum Collection {
    company
  }

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

  extend input EntityInput {
    company: CompanyInput
  }

  input ImportCompanyInput {
    short_name: String
    name: String
    name_tc: String
    reg_number: String
    contact_number: String
    address: String
    email: String
    remarks: String
    status: Boolean

    vehicle: String
    vehicle_effective_date: String
    vehicle_end_date: String
    vehicle_value: String
  }

  extend input ImportEntityInput {
    company: [ImportCompanyInput]
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
