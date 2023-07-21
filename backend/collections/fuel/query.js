export const query = `#graphql

  extend enum Collection {
    fuel
  }

  extend union Entity = Fuel

  input FuelInput {
    status: Boolean

    fuel_type: String
    provider: String
    account_number: String
    card_number: String
    effective_date: String
    end_date: String
  }

  extend input EntityInput {
    fuel: FuelInput
  }

  input ImportFuelInput {
    fuel_type: String
    provider: String
    account_number: String
    card_number: String
    effective_date: String
    end_date: String

    vehicle: String
    vehicle_effective_date: String
    vehicle_end_date: String
  }

  extend input ImportEntityInput {
    fuel: [ImportFuelInput]
  }

  type Fuel {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    fuel_type: String
    provider: String
    account_number: String
    card_number: String
    effective_date: String
    end_date: String
  }
`
