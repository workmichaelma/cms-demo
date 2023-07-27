const Listing = `#graphql
  type GPSListingResultData {
    _id: ID
    status: String

  }

  extend union ListingResultData = GPSListingResultData
`

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

    vehicles: [AutotollVehicle]
    current_vehicle: Vehicle
  }

  type GPSVehicle {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String

    chassis_number: String
    reg_mark: String
  }

  extend input EntityInput {
    gps: GpsInput
  }

  input ImportGpsInput {
    gps_number: String
    charge: String

    vehicle: String
    vehicle_effective_date: String
    vehicle_end_date: String
  }

  extend input ImportEntityInput {
    gps: [ImportGpsInput]
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

  ${Listing}
`
