export const query = `#graphql

  extend type Mutation {
    insertContractDeduct(data: ContractDeductInput): Boolean
    updateContractDeduct(_id: ID, data: ContractDeductInput): Boolean
    deleteContractDeduct(_id: ID): Boolean
  }

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
`
