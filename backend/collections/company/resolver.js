import lodash from 'lodash'
import { schema } from './config.js'

const { isEmpty } = lodash

export const Query = {}

export const Mutation = {}

export const Field = {
  Company: {
    vehicles: async (parent, args, contextValue, info) => {
      try {
        const Model = contextValue?.Model.company

        if (parent && parent?._id) {
          const vehicles = await Model.getAllVehicles({
            _id: parent?._id,
          })
          if (vehicles && !isEmpty(vehicles)) {
            return vehicles.map((vehicle) => {
              return {
                doc_id: vehicle?.companies?._id,
                effective_date: vehicle?.companies?.effective_date,
                end_date: vehicle?.companies?.end_date,
                value: vehicle?.companies?.value,
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
