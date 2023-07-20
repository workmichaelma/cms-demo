export const query = `#graphql

  extend type Mutation {
    insertContract(data: ContractInput): Boolean
    updateContract(_id: ID, data: ContractInput): Boolean
    deleteContract(_id: ID): Boolean
  }

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
