export const query = `#graphql
  extend type Query {
    file(_id: ID!): File
  }

  type File {
    filename: String
    name: String
    url: String
    size: String
    mimetype: String
  }
`
