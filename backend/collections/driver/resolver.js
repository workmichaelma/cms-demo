import { schema } from './config.js'

export const Query = {
}

export const Mutation = {
	login: async (parent, args, contextValue, info) => {
		const { user } = contextValue?.Model
		const { username, password } = args?.data || {}
		if (username && password) {
			const doc = await user.findOne({ filter: { username } })
			if (doc && doc.password === password) {
				const session = contextValue?.session
				session.username = username
				session.display_name = doc.display_name
				session.permissions = doc.permissions
				session.user_id = doc._id

				contextValue.Model.user.setUserId(doc._id)
				return true
			}
		}
		return false
	},
	logout: async (parent, args, contextValue, info) => {
		const session = contextValue?.session
		session.username = undefined
		session.display_name = undefined
		session.permissions = undefined
		session.user_id = undefined
		contextValue.Model.user.setUserId(null)
	},
	registerUser: async (parent, args, contextValue, info) => {
		const { user } = contextValue?.Model
		const { username, password, display_name, is_admin } = args?.data || {}
		if (username && password) {
			const doc = await user.register({
				username,
				password,
				display_name,
				is_admin,
			})
			if (doc && doc._id) {
				return true
			}
		}
		return false
	},
}
