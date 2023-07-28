const Listing = `#graphql
  type RegMarkListingResultData {
    _id: ID
    status: String

    reg_mark: String
  }

  extend union ListingResultData = RegMarkListingResultData
`

export const query = `#graphql

  type RegMark {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    reg_mark: String
    effective_date: String
    end_date: String
  }

  extend input EntityInput {
    regMark: RegMarkInput
  }

  input ImportRegMarkInput {
    reg_mark: String
    effective_date: String
    end_date: String

    vehicle: String
    vehicle_effective_date: String
    vehicle_end_date: String
  }

  extend input ImportEntityInput {
    regMark: [ImportRegMarkInput]
  }

  extend enum Collection {
    regMark
  }

  extend union Entity = RegMark

  input RegMarkInput {
    status: Boolean

    reg_mark: String
    effective_date: String
    end_date: String
    company: ID

    relation: RegMarkRelationInput
  }

  input RegMarkRelationInput {
    collection: Collection!
    action: String!
    doc_id: ID
    target_id: ID
    status: Boolean

    effective_date: String
    end_date: String
  }

  ${Listing}
`
