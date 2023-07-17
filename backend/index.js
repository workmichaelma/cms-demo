import { ApolloServer } from '@apollo/server'
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import path from 'path'
import bodyParser from 'body-parser'
import express from 'express'

import connectMongoDB from '#_/config/mongodb.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const app = express()
const isLocal = process.env.mode === 'local'

// Allow local access
if (isLocal) {
	app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
}

connectMongoDB(app)

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }
	scalar Upload
	input Text {
		name: String
		age: Int
		file: Upload
	}

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
  type Mutation {
    uploadFile(file: Upload!, name: [Text]): String
  }
`
const books = [
	{
		title: 'The Awakening',
		author: 'Kate Chopin',
	},
	{
		title: 'City of Glass',
		author: 'Paul Auster2',
	},
]
const resolvers = {
	// Query: {
	// 	books: () => books,
	// },
	// Mutation: {
	// 	uploadFile: async (_, { file, name }) => {
	// 		console.log(file.file, name)
	// 		const { createReadStream, filename, mimetype, encoding } = file.file
	// 		// Process the file data here
	// 		return filename
	// 	},
	// },
}

import Query from '#_/graphql/query.js'
import Resolver from '#_/graphql/resolver.js'

// console.log(await Resolver.getResolvers())

const server = new ApolloServer({
	typeDefs: await Query.getQueries(),
	resolvers: await Resolver.getResolvers(),
	uploads: false,
})

await server.start()

app.use(express.static(path.join(__dirname, '/frontend/build')))
app.use(
	'/graphql',
	cors(),
	graphqlUploadExpress(),
	bodyParser.json(),
	expressMiddleware(server, {
		context: async ({ req }) => req,
	})
)
app.use('/admin', (req, res, next) => {
	res.sendFile(path.join(__dirname, '/frontend/build', 'index.html'))
})

const PORT = process.env.PORT || 80
app.listen(PORT, () => {
	console.log('Running on ' + PORT + ', mode: ' + process.env.mode)
})
