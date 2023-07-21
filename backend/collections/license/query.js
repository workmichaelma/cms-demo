export const query = `#graphql
  input LicenseInput {
    status: Boolean

    license_fee: Float
    special_permit: String
    permit_fee: Float
    remarks: String
    effective_date: Float
    end_date: String
    contract: ID
    reg_mark: ID
  }

  extend input EntityInput {
    license: LicenseInput
  }

  input ImportLicenseInput {
    license_fee: String
    special_permit: String
    permit_fee: String
    remarks: String
    effective_date: String
    end_date: String
    status: Boolean

    vehicle: String
    vehicle_effective_date: String
    vehicle_end_date: String
  }

  extend input ImportEntityInput {
    license: [ImportLicenseInput]
  }

  extend enum Collection {
    license
  }

  extend union Entity = License

  type License {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    license_fee: Float
    special_permit: String
    permit_fee: Float
    remarks: String
    effective_date: Float
    end_date: String
  }
`
