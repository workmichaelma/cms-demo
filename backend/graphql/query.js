import fs from 'fs'
import path from 'path'

const normalizedPath = path.join(
	path.dirname(new URL(import.meta.url).pathname),
	'../collections/'
)

const getQueries = async () => {
	const queries = [
		`#graphql
	    scalar File

      type Page {
        schema: [Schema]
      }

      type Schema {
        field: String
        title: String
        type: String
        is_required: Boolean
        is_password: Boolean
        is_multiple: Boolean
      }

      type Query {
        health: Boolean
      }

      type Mutation {
        isHealthy: Boolean
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
