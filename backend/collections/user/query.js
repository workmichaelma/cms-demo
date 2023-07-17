export const query = `#graphql
  extend type Query {
    currentUser: User
    users: [User]
    user(_id: ID!): User
    userPage: Page
  }

  type User {
    username: String
    password: String
    is_admin: Boolean
    display_name: String
    permissions: [String]
  }

  input registerUserInput {
    username: String!
    password: String!
    is_admin: Boolean
    display_name: String
    permissions: [String]
  }

  input loginInput {
    username: String!
    password: String!
  }

  extend type Mutation {
    registerUser(data: registerUserInput): Boolean
    login(data: loginInput): Boolean
  }
`
