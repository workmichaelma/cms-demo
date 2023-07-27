const Listing = `#graphql
  type ContractDeductListingResultData {
    _id: ID
    status: String

  }

  extend union ListingResultData = ContractDeductListingResultData
`

export const query = `#graphql

  input ContractDeductInput {
    contracts: String
  }

  extend input EntityInput {
    contractDeduct: ContractDeductInput
  }

  extend enum Collection {
    contractDeduct
  }

  extend union Entity = ContractDeduct
  
  type ContractDeduct {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    contracts: [String]
    insurances: [String]
    permit_areas: [String]
    licenses: [String]
  }

  ${Listing}
`
