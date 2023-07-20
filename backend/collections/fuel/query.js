export const query = `#graphql

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

  extend input EntityInput {
    fuel: FuelInput
  }

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
`
