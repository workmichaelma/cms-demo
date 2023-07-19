export const query = `#graphql
  extend type Query {
    driver: Driver
  }

  type Driver {
    staff_number: String
    name: String
    name_tc: String
    hkid: String
    license: String
    dob: String
    regmarks: String
    status: Boolean
  }
`
