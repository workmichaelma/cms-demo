export const query = `#graphql
  extend type Query {
    logs: [Log]
  }

  type Log {
    collection_name: String
    action: String
    doc_id: String
    old_data: String
    data: String
    difference: String
  }
`
