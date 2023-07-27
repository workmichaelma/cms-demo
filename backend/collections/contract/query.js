const Listing = `#graphql
  type ContractListingResultData {
    _id: ID
    status: String

  }

  extend union ListingResultData = ContractListingResultData
`

export const query = `#graphql

  input ContractInput {
    contracts: String
  }

  extend input EntityInput {
    contract: ContractInput
  }

  input ImportContractInput {
    contract_number: String
    short_name: String
    title: String
    title_tc: String
    remarks: String
    effective_date: String
    end_date: String
    status: Boolean

    vehicle: String
    vehicle_effective_date: String
    vehicle_end_date: String
    vehicle_value: String
  }

  extend input ImportEntityInput {
    contract: [ImportContractInput]
  }

  extend enum Collection {
    contract
  }

  extend union Entity = Contract

  type Contract {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    contract_number: String
    short_name: String
    title: String
    title_tc: String
    remarks: String
    effective_date: String
    end_date: String
  }

  ${Listing}
`
