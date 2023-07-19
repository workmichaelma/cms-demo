import GoogleCloud from '@google-cloud/storage'

export const Query = {
	logs: async (parent, args, contextValue, info) => {
		const { log } = contextValue?.Model
		return log.findAll()
	},
}

export const Mutation = {}
