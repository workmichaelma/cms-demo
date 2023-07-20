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
  }
`
