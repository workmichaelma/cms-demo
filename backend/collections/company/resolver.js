import { schema } from './config.js'

export const Query = {
}

export const Mutation = {
	insertCompany: async (parent, args, contextValue, info) => {
		const { company } = contextValue?.Model
		const { data } = args
		const doc = await company.insert({ body: data })
		if (doc && doc._id) {
			return true
		}
		return false
	},
	updateCompany: async (parent, args, contextValue, info) => {
		const { company } = contextValue?.Model
		const { data, _id } = args
		const doc = await company.updateOne({ _id, body: data })
		if (doc && doc._id) {
			return true
		}
		return false
	},
	deleteCompany: async (parent, args, contextValue, info) => {
		const { company } = contextValue?.Model
		const { _id } = args
		const success = await company.deleteOne({ _id })

		if (success) {
			return true
		}
		return false
	},
}
