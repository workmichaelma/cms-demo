import GoogleCloud from '@google-cloud/storage'

export const Query = {
	file: async (parent, args, contextValue, info) => {
		const { file } = contextValue?.Model
		const { _id } = args
		return file.findOne({ _id })
	},
}

export const Mutation = {}
