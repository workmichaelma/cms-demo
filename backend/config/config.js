const { mode, DB_PREFIX, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } =
	process.env

let DATABASE_PREFIX = DB_PREFIX
let DATABASE_HOST = DB_HOST
let DATABASE_USERNAME = DB_USER
let DATABASE_PASSWORD = DB_PASSWORD
let DATABASE_NAME = DB_NAME
let DATABASE_PORT = `:${DB_PORT}`
let DATABASE_QUERY = '?authSource=admin'
if (mode !== 'local') {
	DATABASE_HOST = 'vms.isnc85f.mongodb.net'
	DATABASE_USERNAME = 'wccl-mongodb'
	DATABASE_PASSWORD = 'XmVF1rDRdr41qgSq'
	DATABASE_PORT = ''
	DATABASE_PREFIX = 'mongodb+srv'
	DATABASE_QUERY = '?retryWrites=true&w=majority&useUnifiedTopology=true'
}

if (mode === 'dev') {
	DATABASE_NAME = 'vms-dev'
}

if (mode === 'preprod' || mode === 'uat') {
	DATABASE_NAME = 'vms-staging'
}

if (mode === 'prod') {
	DATABASE_NAME = 'vms'
}

const DATABASE = {
	host: DATABASE_HOST,
	username: DATABASE_USERNAME,
	password: DATABASE_PASSWORD,
	db: DATABASE_NAME,
	port: DATABASE_PORT,
	prefix: DATABASE_PREFIX,
	query: DATABASE_QUERY,
}

const SEESSION_SECRET = 'odf firebase session 20200619'

export default {
	DATABASE,
	SEESSION_SECRET,
}
