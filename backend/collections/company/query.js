const Listing = `#graphql
  type CompanyListingResultData {
    _id: ID
    status: String

    short_name: String
    name_tc: String
    reg_number: String
  }

  extend union ListingResultData = CompanyListingResultData
`

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

    relation: CompanyRelationInput
  }

  input CompanyRelationInput {
    collection: Collection!
    action: String!
    doc_id: ID
    target_id: ID
    status: Boolean

    effective_date: String
    end_date: String
    value: String
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

    vehicles: [CompanyVehicle]
  }

  type CompanyVehicle {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String

    chassis_number: String
    reg_mark: String
  }

  ${Listing}
`
