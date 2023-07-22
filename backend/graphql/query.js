import fs from 'fs'
import path from 'path'

const normalizedPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../collections/')

const getQueries = async () => {
  const queries = [
    `#graphql
	    scalar File
      scalar Money

      enum Collection {
        _
      }
      type _ {
        _id: String
      }

      union Entity = _
      input EntityInput
      input ImportEntityInput

      type Page {
        schema: [Schema]
      }

      type Schema {
        field: String
        title: String
        type: String
        placeholder: String
        is_required: Boolean
        is_password: Boolean
        is_multiple: Boolean
        is_phone: Boolean
        is_email: Boolean
      }

      type Query {
        health: Boolean
        entity(collection: Collection!, _id: ID!): Entity
        entities(collection: Collection!): [Entity]
        entityDistinctField(collection: Collection!, field: String): [String]
        page(collection: Collection!): Page
      }

      type Mutation {
        isHealthy: Boolean
        insertEntity(collection: Collection!, body: EntityInput): Boolean
        updateEntity(collection: Collection!, _id: ID!, body: EntityInput): Boolean
        deleteEntity(collection: Collection!, _id: ID!): Boolean
        importEntities(collection: Collection!, body: ImportEntityInput): Int
      }
    `,
  ]
  for (const folder of fs.readdirSync(normalizedPath)) {
    const query = await import(`../collections/${folder}/query.js`)
    queries.push(query.query)
  }

  return queries
}

export default {
  getQueries,
}
