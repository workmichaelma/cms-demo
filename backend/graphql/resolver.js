import fs from 'fs'
import path from 'path'

const normalizedPath = path.join(
	path.dirname(new URL(import.meta.url).pathname),
	'../collections/'
)

const getResolvers = async () => {
	let Query = {
		health: () => true,
	}
	let Mutation = {
		isHealthy: () => true,
	}
	for (const folder of fs.readdirSync(normalizedPath)) {
		const resolver = await import(`../collections/${folder}/resolver.js`)
		Query = {
			...Query,
			...resolver.Query,
		}
		Mutation = {
			...Mutation,
			...resolver.Mutation,
		}
	}

	return {
		Query,
		Mutation,
	}
}

export default {
	getResolvers,
}
