const Listing = `#graphql
  type AutotollListingResultData {
    _id: ID
    status: String

    autotoll_number: String
    effective_date: String
    end_date: String
    reg_mark: String
    chassis_number: String
  }

  extend union ListingResultData = AutotollListingResultData
`

export const query = `#graphql
  input AutotollInput {
    autotoll_number: String

    relation: AutotollRelationInput
  }

  input AutotollRelationInput {
    collection: Collection!
    action: String
    doc_id: ID
    target_id: ID
    status: Boolean

    effective_date: String
    end_date: String
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

    vehicles: [AutotollVehicle]
    current_vehicle: Vehicle
  }

  type AutotollVehicle {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String

    chassis_number: String
    reg_mark: String
  }

  ${Listing}
`
