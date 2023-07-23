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

    vehicles: [PermitAreaVehicle]
  }

  type PermitAreaVehicle {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String

    chassis_number: String
    reg_mark: String
  }

  extend input EntityInput {
    permitArea: PermitAreaInput
  }

  input ImportPermitAreaInput {
    area: String
    fee: String
    remarks: String
    effective_date: String
    end_date: String
    contract_deduct: ID

    vehicle: String
    vehicle_effective_date: String
    vehicle_end_date: String
  }

  extend input ImportEntityInput {
    permitArea: [ImportPermitAreaInput]
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

    relation: PermitAreaRelationInput
  }

  input PermitAreaRelationInput {
    collection: Collection!
    action: String!
    doc_id: ID
    target_id: ID
    status: Boolean

    effective_date: String
    end_date: String
  }
`
