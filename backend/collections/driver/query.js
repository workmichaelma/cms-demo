const Listing = `#graphql
  type DriverListingResultData {
    _id: ID
    status: String

    staff_number: String
    name: String
    name_tc: String
    license: String
    dob: String
    hkid: String
  }

  extend union ListingResultData = DriverListingResultData
`

export const query = `#graphql

  type Driver {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    staff_number: String
    name: String
    name_tc: String
    hkid: String
    license: String
    dob: String
    regmarks: String
    status: Boolean
  }

  extend input EntityInput {
    driver: DriverInput
  }

  extend enum Collection {
    driver
  }

  extend union Entity = Driver

  input DriverInput {
    staff_number: String
    name: String
    name_tc: String
    hkid: String
    license: String
    dob: String
    regmarks: String
    status: Boolean
  }

  ${Listing}
`
