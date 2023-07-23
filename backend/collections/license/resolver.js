import lodash from 'lodash'
import { schema } from './config.js'

const { isEmpty } = lodash

export const Query = {}

export const Mutation = {}

export const Field = {
  License: {
    vehicles: async (parent, args, contextValue, info) => {
      try {
        const Model = contextValue?.Model.license

        if (parent && parent?._id) {
          const vehicles = await Model.getAllVehicles({
            _id: parent?._id,
          })
          if (vehicles && !isEmpty(vehicles)) {
            return vehicles.map((vehicle) => {
              return {
                doc_id: vehicle?.licenses?._id,
                effective_date: vehicle?.licenses?.effective_date,
                end_date: vehicle?.licenses?.end_date,
                target_id: vehicle?._id,
                chassis_number: vehicle?.chassis_number,
                reg_mark: vehicle?.current_reg_mark[0]?.reg_mark,
              }
            })
          }
        }
        return []
      } catch (err) {
        console.error(`Failed to get vehicles, reason: ${err}`)
        return null
      }
    },
  },
}
