import { gql } from '@apollo/client'

import { ENTITY_BASIC, PAGE_SCHEMA_FRAGMENT, RELATION_BASIC } from 'utils/query'

const GENERAL = gql`
  query getEntityById($collection: Collection!, $_id: ID!, $tab: String, $page: String) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        chassis_number
        color
        body_type
        car_loan
        in_charge
        print_number
        mvmd_remarks
        district
        usage
        purpose
        type
        type_detail
        make
        maintainance
        maintainance_remarks
        maintainance_end_date
        maintenance_mileage
        vehicle_class
        license
        vehicle_model
        engine_number
        cylinder_capacity
        gross_weight
        registered_owner
        owner_registration_date
        manufacture_year
        first_registration_date
        gratia_payment_scheme
        rearview_mirror
        spare_key
        new_car
        remarks
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }

  ${PAGE_SCHEMA_FRAGMENT}
`

const COMPANY = gql`
  query getEntityById($collection: Collection!, $_id: ID!, $tab: String, $page: String) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        companies {
          ${RELATION_BASIC}
          name
          value
        }
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }
  ${PAGE_SCHEMA_FRAGMENT}
`

const CONTRACT = gql`
  query getEntityById($collection: Collection!, $_id: ID!, $tab: String, $page: String) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        contracts {
          ${RELATION_BASIC}
          contract_number
        }
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }
  ${PAGE_SCHEMA_FRAGMENT}
`

const REG_MARK = gql`
  query getEntityById($collection: Collection!, $_id: ID!, $tab: String, $page: String) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        reg_marks {
          ${RELATION_BASIC}
          reg_mark
        }
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }
  ${PAGE_SCHEMA_FRAGMENT}
`

const PERMIT_AREA = gql`
  query getEntityById($collection: Collection!, $_id: ID!, $tab: String, $page: String) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        permit_areas{
          ${RELATION_BASIC}
          area
          fee
        }
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }
  ${PAGE_SCHEMA_FRAGMENT}
`

const GPS = gql`
  query getEntityById($collection: Collection!, $_id: ID!, $tab: String, $page: String) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        gpses{
          ${RELATION_BASIC}
          gps_number
          charge
        }
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }
  ${PAGE_SCHEMA_FRAGMENT}
`

const AUTOTOLL = gql`
  query getEntityById($collection: Collection!, $_id: ID!, $tab: String, $page: String) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        autotolls{
          ${RELATION_BASIC}
          autotoll_number
        }
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }
  ${PAGE_SCHEMA_FRAGMENT}
`

const FUEL = gql`
  query getEntityById($collection: Collection!, $_id: ID!, $tab: String, $page: String) {
    entity(collection: $collection, _id: $_id) {
      ... on Vehicle {
        ${ENTITY_BASIC}
        fuels{
          ${RELATION_BASIC}
          card_number
          fuel_type
          provider
          account_number
        }
      }
    }

    page(collection: $collection) {
      ...PageSchemaFragment
    }
  }
  ${PAGE_SCHEMA_FRAGMENT}
`

export default {
  GENERAL,
  COMPANY,
  CONTRACT,
  REG_MARK,
  PERMIT_AREA,
  GPS,
  AUTOTOLL,
  FUEL,
}
