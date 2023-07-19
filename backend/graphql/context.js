import { Company } from '#_/collections/company/model.js'
import { File } from '#_/collections/file/model.js'
import { Log } from '#_/collections/log/model.js'
import { User } from '#_/collections/user/model.js'
import mongoose from 'mongoose'

const company = new Company()
const file = new File()
const user = new User()
const log = new Log()

const getModel = async (props) => {
	const Model = {}

	if (props?.user_id) {
		const user_id = new mongoose.Types.ObjectId(props.user_id)
		company.setUserId(user_id)
		file.setUserId(user_id)
		log.setUserId(user_id)
		user.setUserId(user_id)
	}
	Model.company = company
	Model.file = file
	Model.log = log
	Model.user = user
	return Model
}

export default {
	getModel,
}
