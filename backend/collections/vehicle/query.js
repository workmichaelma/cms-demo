const Listing = `#graphql
  type VehicleListingResultData {
    status: String

    reg_mark: String
    chassis_number: String
    print_number: String
    in_charge: String
    type: String
    purpose: String
    make: String
    vehicle_class: String
    license: String
    color: String
    manufacture_year: String
  }

  extend union ListingResultData = VehicleListingResultData
`

export const query = `#graphql

  type Vehicle {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    status: Boolean

    in_charge: String
    print_number: String
    chassis_number: String
    mvmd_remarks: String
    district: String
    usage: String
    purpose: String
    type: String
    type_detail: String
    make: String
    maintainance: String
    maintainance_remarks: String
    maintainance_end_date: String
    maintenance_mileage: String
    vehicle_class: String
    license: String
    vehicle_model: String
    engine_number: String
    cylinder_capacity: String
    color: String
    body_type: String
    gross_weight: String
    registered_owner: String
    owner_registration_date: String
    manufacture_year: String
    first_registration_date: String
    car_loan: String
    gratia_payment_scheme: String
    rearview_mirror: String
    spare_key: String
    new_car: String
    remarks: String
    current_reg_mark: RegMark

    companies: [VehicleCompany]
    contracts: [VehicleContract]
    reg_marks: [VehicleRegMark]
    permit_areas: [VehiclePermitArea]
    licenses: [VehicleLicense]
    insurances: [VehicleInsurance]
    autotolls: [VehicleAutotoll]
    gpses: [VehicleGps]
    fuels: [VehicleFuel]
  }

  type VehicleCompany {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    name: String
    value: Money
  }

  type VehicleContract {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    contract_number: String
  }

  type VehicleRegMark {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    reg_mark: String
  }

  type VehiclePermitArea {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    area: String
    fee: Money
    contract_number: String
  }

  type VehicleLicense {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    license_fee: String
    special_permit: String
    permit_fee: String
    reg_mark: String
    contract_number: String
  }

  type VehicleInsurance {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    insurance_company: String
    insurance_kind: String
    policy_number: String
    policy_number2: String
    insurance_fee: Money
    reg_mark: String
    contract_number: String
  }

  type VehicleAutotoll {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    autotoll_number: String
  }

  type VehicleGps {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    gps_number: String
    charge: Money
  }

  type VehicleFuel {
    doc_id: ID
    target_id: ID
    effective_date: String
    end_date: String
    fuel_type: String
    provider: String
    account_number: String
    card_number: String
  }

  extend enum Collection {
    vehicle
  }

  extend union Entity = Vehicle

  input VehicleInput {
    status: Boolean

    in_charge: String
    print_number: String
    chassis_number: String
    mvmd_remarks: String
    district: String
    usage: String
    purpose: String
    type: String
    type_detail: String
    make: String
    maintainance: String
    maintainance_remarks: String
    maintainance_end_date: String
    maintenance_mileage: String
    vehicle_class: String
    license: String
    vehicle_model: String
    engine_number: String
    cylinder_capacity: String
    color: String
    body_type: String
    gross_weight: String
    registered_owner: String
    owner_registration_date: String
    manufacture_year: String
    first_registration_date: String
    car_loan: String
    gratia_payment_scheme: String
    rearview_mirror: String
    spare_key: String
    new_car: String
    remarks: String

    relation: VehicleRelationInput
  }

  input VehicleRelationInput {
    collection: Collection!
    action: String
    doc_id: ID
    target_id: ID
    status: Boolean

    effective_date: String
    end_date: String
    value: String
  }

  extend input EntityInput {
    vehicle: VehicleInput
  }

  input ImportVehicleInput {
    status: Boolean

    in_charge: String
    print_number: String
    chassis_number: String
    mvmd_remarks: String
    district: String
    usage: String
    purpose: String
    type: String
    type_detail: String
    make: String
    maintainance: String
    maintainance_remarks: String
    maintainance_end_date: String
    maintenance_mileage: String
    vehicle_class: String
    license: String
    vehicle_model: String
    engine_number: String
    cylinder_capacity: String
    color: String
    body_type: String
    gross_weight: String
    registered_owner: String
    owner_registration_date: String
    manufacture_year: String
    first_registration_date: String
    car_loan: String
    gratia_payment_scheme: String
    rearview_mirror: String
    spare_key: String
    spare_key_2: String
    new_car: String
    remarks: String
  }

  extend input ImportEntityInput {
    vehicle: [ImportVehicleInput]
  }

  ${Listing}
`
