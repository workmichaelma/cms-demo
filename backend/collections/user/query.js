export const query = `#graphql
  extend type Query {
    currentUser: User
  }

  type User {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    username: String
    password: String
    is_admin: Boolean
    display_name: String
    permissions: [String]
  }

  extend input EntityInput {
    user: RegisterUserInput
  }

  extend enum Collection {
    user
  }

  extend union Entity = User

  input RegisterUserInput {
    username: String!
    password: String!
    is_admin: Boolean
    display_name: String
    permissions: [String]
  }

  input LoginInput {
    username: String!
    password: String!
  }

  extend type Mutation {
    registerUser(data: RegisterUserInput): Boolean
    login(data: LoginInput): Boolean
    logout: Boolean
  }
`
