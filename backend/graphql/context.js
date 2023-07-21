import { Autotoll } from '#_/collections/autotoll/model.js'
import { Company } from '#_/collections/company/model.js'
import { Contract } from '#_/collections/contract/model.js'
import { ContractDeduct } from '#_/collections/contract_deduct/model.js'
import { Driver } from '#_/collections/driver/model.js'
import { DriverPermit } from '#_/collections/driver_permit/model.js'
import { File } from '#_/collections/file/model.js'
import { Fuel } from '#_/collections/fuel/model.js'
import { GPS } from '#_/collections/gps/model.js'
import { License } from '#_/collections/license/model.js'
import { Log } from '#_/collections/log/model.js'
import { PermitArea } from '#_/collections/permit_area/model.js'
import { Vehicle } from '#_/collections/vehicle/model.js'
import { User } from '#_/collections/user/model.js'
import mongoose from 'mongoose'

const autotoll = new Autotoll()
const company = new Company()
const contract = new Contract()
const contractDeduct = new ContractDeduct()
const driver = new Driver()
const driverPermit = new DriverPermit()
const file = new File()
const fuel = new Fuel()
const gps = new GPS()
const license = new License()
const log = new Log()
const permitArea = new PermitArea()
const vehicle = new Vehicle()
const user = new User()

const getModel = async (props) => {
  const Model = {}

  if (props?.user_id) {
    const user_id = new mongoose.Types.ObjectId(props.user_id)
    autotoll.setUserId(user_id)
    company.setUserId(user_id)
    contract.setUserId(user_id)
    contractDeduct.setUserId(user_id)
    driver.setUserId(user_id)
    driverPermit.setUserId(user_id)
    file.setUserId(user_id)
    fuel.setUserId(user_id)
    gps.setUserId(user_id)
    license.setUserId(user_id)
    log.setUserId(user_id)
    permitArea.setUserId(user_id)
    vehicle.setUserId(user_id)
    user.setUserId(user_id)
  }
  Model.autotoll = autotoll
  Model.company = company
  Model.contract = contract
  Model.contractDeduct = contractDeduct
  Model.file = file
  Model.fuel = fuel
  Model.gps = gps
  Model.license = license
  Model.log = log
  Model.permitArea = permitArea
  Model.vehicle = vehicle
  Model.user = user
  return Model
}

export default {
  getModel,
}
