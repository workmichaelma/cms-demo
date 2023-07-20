export const query = `#graphql

  type GPS {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    gps_number: String
    charge: String
  }

  extend input EntityInput {
    gps: GpsInput
  }

  extend enum Collection {
    gps
  }

  extend union Entity = GPS

  input GpsInput {
    status: Boolean

    gps_number: String
    charge: String
  }
`
