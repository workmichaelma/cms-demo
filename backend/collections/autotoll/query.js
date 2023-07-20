export const query = `#graphql
  input AutotollInput {
    autotoll_number: String
  }

  extend input EntityInput {
    autotoll: AutotollInput
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
