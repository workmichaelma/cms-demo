import mongoose from 'mongoose'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import config from './config.js'

const { DATABASE, SEESSION_SECRET } = config

const url = `${DATABASE.prefix}://${DATABASE.username}:${DATABASE.password}@${DATABASE.host}${DATABASE.port}/${DATABASE.db}${DATABASE.query}`

const connectMongoDB = (app) => {
	console.log('Starting db:', url)

	mongoose
		.connect(url, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log('Connected to the database!')
		})
	app.use(
		session({
			secret: SEESSION_SECRET,
			resave: true,
			saveUninitialized: true,
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 30, //config.session_timeout * 1000, //
			},
			store: MongoStore.create({
				mongoUrl: url,
			}),
		})
	)
}

export default connectMongoDB
