export const Query = {
}

export const Mutation = {
	insertContract: async (parent, args, contextValue, info) => {
		const { contract } = contextValue?.Model
		const { data } = args
		const doc = await contract.insert({ body: data })
		if (doc && doc._id) {
			return true
		}
		return false
	},
	updateContract: async (parent, args, contextValue, info) => {
		const { contract } = contextValue?.Model
		const { data, _id } = args
		const doc = await contract.updateOne({ _id, body: data })
		if (doc && doc._id) {
			return true
		}
		return false
	},
	deleteContract: async (parent, args, contextValue, info) => {
		const { contract } = contextValue?.Model
		const { _id } = args
		const success = await contract.deleteOne({ _id })

		if (success) {
			return true
		}
		return false
	},
}
