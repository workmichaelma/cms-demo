export const query = `#graphql
  input AutotollInput {
    autotoll_number: String
  }

  extend input EntityInput {
    autotoll: AutotollInput
  }

  input ImportAutotollInput {
    autotoll_number: String
    vehicle: String
    vehicle_effective_date: String
    vehicle_end_date: String
  }

  extend input ImportEntityInput {
    autotoll: [ImportAutotollInput]
  }

  extend enum Collection {
    autotoll
  }

  extend union Entity = Autotoll

  type Autotoll {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    autotoll_number: String
  }
`
