export const query = `#graphql

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

  extend input EntityInput {
    license: LicenseInput
  }

  extend enum Collection {
    license
  }

  extend union Entity = License

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
`
