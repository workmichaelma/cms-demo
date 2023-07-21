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
`
