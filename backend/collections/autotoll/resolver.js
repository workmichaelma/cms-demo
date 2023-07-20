import { schema } from './config.js'

export const Query = {
}

export const Mutation = {
	insertAutotoll: async (parent, args, contextValue, info) => {
		const { autotoll } = contextValue?.Model
		const { data } = args
		const doc = await autotoll.insert({ body: data })
		if (doc && doc._id) {
			return true
		}
		return false
	},
	updateAutotoll: async (parent, args, contextValue, info) => {
		const { autotoll } = contextValue?.Model
		const { data, _id } = args
		const doc = await autotoll.updateOne({ _id, body: data })
		if (doc && doc._id) {
			return true
		}
		return false
	},
	deleteAutotoll: async (parent, args, contextValue, info) => {
		const { autotoll } = contextValue?.Model
		const { _id } = args
		const success = await autotoll.deleteOne({ _id })

		if (success) {
			return true
		}
		return false
	},
}
