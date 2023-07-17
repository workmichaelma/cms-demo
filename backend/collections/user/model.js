import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema } from './config.js'

export class User extends Model {
	constructor() {
		super('user', schema)

		this.Schema.statics.register = this.register
	}

	async register({ username, password }) {
		const encrptedPassword = encrypt(password)
		const doc = await this.insert({
			body: { username, password: encrptedPassword },
		})
		return doc
	}

	async findOne({ filter }) {
		const doc = await super.findOne({ filter })

		if (doc) {
			return {
				...doc,
				password: decrypt(doc?.password),
			}
		}
		return null
	}

	async findAll({ filter } = {}) {
		const users = await super.findAll()
		return users.map((user) => {
			return {
				...user,
				password: decrypt(user.password) || null,
			}
		})
	}
}
