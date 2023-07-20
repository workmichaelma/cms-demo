import { Autotoll } from '#_/collections/autotoll/model.js'
import { Company } from '#_/collections/company/model.js'
import { ContractDeduct } from '#_/collections/contract_deduct/model.js'
import { Driver } from '#_/collections/driver/model.js'
import { DriverPermit } from '#_/collections/driver_permit/model.js'
import { File } from '#_/collections/file/model.js'
import { Log } from '#_/collections/log/model.js'
import { User } from '#_/collections/user/model.js'
import mongoose from 'mongoose'

const autotoll = new Autotoll()
const company = new Company()
const contractDeduct = new ContractDeduct()
const driver = new Driver()
const driverPermit = new DriverPermit()
const file = new File()
const log = new Log()
const user = new User()

const getModel = async (props) => {
  const Model = {}

  if (props?.user_id) {
    const user_id = new mongoose.Types.ObjectId(props.user_id)
    autotoll.setUserId(user_id)
    company.setUserId(user_id)
    contractDeduct.setUserId(user_id)
    driver.setUserId(user_id)
    driverPermit.setUserId(user_id)
    file.setUserId(user_id)
    log.setUserId(user_id)
    user.setUserId(user_id)
  }
  Model.autotoll = autotoll
  Model.company = company
  Model.contractDeduct = contractDeduct
  Model.file = file
  Model.log = log
  Model.user = user
  return Model
}

export default {
  getModel,
}
