export const query = `#graphql

  type DriverPermit {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    vehicle_count: String
    application_date: String
    approval_date: String
  }

  extend input EntityInput {
    driverPermit: DriverPermitInput
  }

  extend enum Collection {
    driverPermit
  }

  extend union Entity = DriverPermit

  input DriverPermitInput {
    status: Boolean

    application_date: String
    approval_date: String
    company: ID
    driver: ID
    vehicles: [ID]
  }
`
