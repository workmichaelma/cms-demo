import { schema } from './config.js'
import { User } from './model.js'
const user = new User()

export const Query = {
	currentUser: (parent, args, contextValue, info) => {
		const { session } = contextValue
		return {
			username: session.username,
			display_name: session.display_name,
			permissions: session.permissions,
		}
	},
	users: async () => {
		return user.findAll()
	},
	user: async (parent, args, contextValue, info) => {
		const { _id } = args
		return user.findOne({ _id })
	},
	userPage: () => {
		return {
			schema,
		}
	},
}

export const Mutation = {
	login: async (parent, args, contextValue, info) => {
		const { username, password } = args?.data || {}
		if (username && password) {
			const doc = await user.findOne({ filter: { username } })
			if (doc && doc.password === password) {
				const { session } = contextValue
				session.username = username
				session.display_name = doc.display_name
				session.permissions = doc.permissions
				return true
			}
		}
		return false
	},
	registerUser: async (parent, args, contextValue, info) => {
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
