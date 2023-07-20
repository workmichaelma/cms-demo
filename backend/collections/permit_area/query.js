export const query = `#graphql

  type PermitArea {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    area: String
    fee: Float
    remarks: String
    effective_date: String
    end_date: String
  }

  extend input EntityInput {
    permitArea: PermitAreaInput
  }

  extend enum Collection {
    permitArea
  }

  extend union Entity = PermitArea

  input PermitAreaInput {
    status: Boolean

    area: String
    fee: Float
    remarks: String
    effective_date: String
    end_date: String
    contract: ID
  }
`
