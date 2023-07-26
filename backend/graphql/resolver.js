import fs from 'fs'
import lodash from 'lodash'
import path from 'path'
import { GraphQLScalarType } from 'graphql'

const { capitalize, isEmpty } = lodash

const normalizedPath = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '../collections/'
)

const getResolvers = async () => {
  let Query = {
    health: () => true,
    entity: async (parent, args, contextValue, info) => {
      const { collection, _id } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        if (Model) {
          return Model.findOne({ filter: { _id } })
        }
      }
      return null
    },
    entities: async (parent, args, contextValue, info) => {
      const { collection } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        if (Model) {
          return Model.findAll({})
        }
      }
      return null
    },
    entityDistinctField: async (parent, args, contextValue, info) => {
      const { collection, field } = args || {}
      if (collection && field) {
        const Model = contextValue?.Model[collection]
        if (Model) {
          return Model.distinct(field)
        }
      }
      return []
    },
    page: async (parent, args, contextValue, info) => {
      const { collection } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        if (Model) {
          return {
            schema: [
              {
                field: 'status',
                title: '狀況',
                type: 'boolean',
              },
              ...Model.schema,
            ],
            pageConfig: {
              pages: Model.pageConfig?.pages?.profile,
            },
          }
        }
      }
      return null
    },
    listing: async (parent, args, contextValue, info) => {
      const { collection, ...props } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        if (Model) {
          return Model.listing({ ...props })
        }
      }
      return null
    },
  }
  let Mutation = {
    isHealthy: () => true,
    updateEntity: async (parent, args, contextValue, info) => {
      const { collection, _id, body } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        const doc = await Model.updateOne({
          filter: { _id },
          body: body[collection],
        })
        if (doc && doc._id) {
          return true
        }
      }
      return false
    },
    insertEntity: async (parent, args, contextValue, info) => {
      const { collection, body } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        const doc = await Model.insert({ body: body[collection] })
        if (doc && doc._id) {
          return true
        }
      }
      return false
    },
    deleteEntity: async (parent, args, contextValue, info) => {
      const { collection, _id } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        const doc = await Model.deleteOne({ _id })
        return doc
      }
      return false
    },
    importEntities: async (parent, args, contextValue, info) => {
      const { collection, body } = args || {}
      if (collection && !isEmpty(body)) {
        const Model = contextValue?.Model[collection]
        return Model.import({ body: body[collection] })
      }
    },
  }
  let Field = {
    Entity: {
      __resolveType: (obj, contextValue, info) => {
        const { collection } = info?.variableValues || {}

        if (collection === 'gps') {
          return 'GPS'
        }

        return `${capitalize(collection.charAt(0))}${collection.slice(1)}`
      },
    },
    Money: new GraphQLScalarType({
      name: 'Money',
      serialize(value) {
        return `$${value.toString()}`
      },
    }),
    ListingResultData: {
      __resolveType: (obj, contextValue, info) => {
        const { collection } = info?.variableValues || {}
        let prefix = `${capitalize(collection.charAt(0))}${collection.slice(1)}`

        if (collection === 'gps') {
          prefix = 'GPS'
        }

        return `${prefix}ListingResultData`
      },
    },
  }
  for (const folder of fs.readdirSync(normalizedPath)) {
    const resolver = await import(`../collections/${folder}/resolver.js`)
    Query = {
      ...Query,
      ...resolver.Query,
    }
    Mutation = {
      ...Mutation,
      ...resolver.Mutation,
    }
    Field = {
      ...Field,
      ...resolver.Field,
    }
  }

  return {
    Query,
    Mutation,
    ...Field,
  }
}

export default {
  getResolvers,
}
