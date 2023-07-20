export const query = `#graphql

  type File {
    _id: ID
    created_by: User
    created_at: String
    updated_by: User
    updated_at: String
    filename: String
    name: String
    url: String
    size: String
    mimetype: String
  }
`
