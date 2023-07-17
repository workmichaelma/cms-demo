export const query = `#graphql
  extend type Query {
    company(_id: ID!): Company
    companies: [Company]
    companyPage: Page
  }

  extend type Mutation {
    insertCompany(data: CompanyInput): Boolean
    updateCompany(_id: ID, data: CompanyInput): Boolean
  }

  input CompanyInput {
    short_name: String
    name: String
    name_tc: String
    reg_number: String
    contact_number: String
    address: String
    email: String
    remarks: String
  }

  type Company {
    short_name: String
    name: String
    name_tc: String
    reg_number: String
    contact_number: String
    address: String
    email: String
    remarks: String
    sign_image: ID
    chop_image: ID
    logo_image: ID
  }
`
