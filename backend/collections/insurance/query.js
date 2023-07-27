const Listing = `#graphql
  type InsuranceListingResultData {
    _id: ID
    status: String

  }

  extend union ListingResultData = InsuranceListingResultData
`

export const query = `#graphql

  type Insurance {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    insurance_company: String
    insurance_kind: String
    policy_number: String
    policy_number2: String
    insurance_fee: Float
    remarks: String
    effective_date: String
    end_date: String
  }

  extend input EntityInput {
    insurance: InsuranceInput
  }

  extend enum Collection {
    insurance
  }

  extend union Entity = Insurance

  input InsuranceInput {
    status: Boolean

    insurance_company: String
    insurance_kind: String
    policy_number: String
    policy_number2: String
    insurance_fee: Float
    remarks: String
    effective_date: String
    end_date: String
  }

  ${Listing}
`
