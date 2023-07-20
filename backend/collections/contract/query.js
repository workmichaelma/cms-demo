export const query = `#graphql

  input ContractInput {
    contracts: String
  }

  extend input EntityInput {
    contract: ContractInput
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
    contract_number: String
    short_name: String
    title: String
    title_tc: String
    remarks: String
    effective_date: String
    end_date: String
  }
`
