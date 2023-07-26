import { ApolloServer } from '@apollo/server'
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs'
import { expressMiddleware } from '@apollo/server/express4'
import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import path from 'path'

import Query from './query.js'
import Resolver from './resolver.js'
import Context from './context.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const server = new ApolloServer({
  typeDefs: await Query.getQueries(),
  resolvers: await Resolver.getResolvers(),
  uploads: false,
})
await server.start()
const connectGraphQL = (app) => {
  app.use(express.static(path.join(__dirname, '/frontend/build')))
  app.use(
    '/graphql',
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
    graphqlUploadExpress(),
    bodyParser.json({ limit: '50mb' }),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const { user_id } = req.session
        const Model = await Context.getModel({ user_id })
        return {
          ...req,
          Model,
        }
      },
    })
  )
}
export default connectGraphQL
