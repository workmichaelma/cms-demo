import fs from 'fs'
import lodash from 'lodash'
import path from 'path'

const { capitalize, isEmpty } = lodash

const normalizedPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../collections/')

const getResolvers = async () => {
  let Query = {
    health: () => true,
    entity: async (parent, args, contextValue, info) => {
      const { collection, _id } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        if (Model) {
          return Model.findOne({ _id })
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
    page: async (parent, args, contextValue, info) => {
      const { collection } = args || {}
      if (collection) {
        const Model = contextValue?.Model[collection]
        if (Model) {
          return {
            schema: Model.schema,
          }
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
        const doc = await Model.updateOne({ filter: { _id }, body: body[collection] })
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
  }

  return {
    Query,
    Mutation,
    Entity: {
      __resolveType: (obj, contextValue, info) => {
        const { collection } = info?.variableValues || {}
        return capitalize(collection)
      },
    },
  }
}

export default {
  getResolvers,
}
