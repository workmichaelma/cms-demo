import { schema } from './config.js'

export const Query = {
	companies: async (parent, args, contextValue, info) => {
		const { company } = contextValue?.Model
		return company.findAll()
	},
	company: async (parent, args, contextValue, info) => {
		const { company } = contextValue?.Model
		const { _id } = args
		return company.findOne({ _id })
	},
	companyPage: () => {
		return {
			schema,
		}
	},
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
}
