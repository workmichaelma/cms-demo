export const Query = {
}

export const Mutation = {
	insertContractDeduct: async (parent, args, contextValue, info) => {
		const { contractDeduct } = contextValue?.Model
		const { data } = args
		const doc = await contractDeduct.insert({ body: data })
		if (doc && doc._id) {
			return true
		}
		return false
	},
	updateContractDeduct: async (parent, args, contextValue, info) => {
		const { contractDeduct } = contextValue?.Model
		const { data, _id } = args
		const doc = await contractDeduct.updateOne({ _id, body: data })
		if (doc && doc._id) {
			return true
		}
		return false
	},
	deleteContractDeduct: async (parent, args, contextValue, info) => {
		const { contractDeduct } = contextValue?.Model
		const { _id } = args
		const success = await contractDeduct.deleteOne({ _id })

		if (success) {
			return true
		}
		return false
	},
}
