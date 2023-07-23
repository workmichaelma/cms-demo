import { schema } from './config.js'

export const Query = {}

export const Mutation = {}

export const Field = {
  Autotoll: {
    vehicles: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.autotoll

      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: {
            path: 'vehicles',
            populate: {
              path: 'vehicle',
              populate: {
                path: 'current_reg_mark',
                model: 'reg_mark',
              },
            },
          },
        })
        if (_doc?.vehicles) {
          return _doc.vehicles.map((vehicle) => {
            return {
              doc_id: vehicle?._id,
              effective_date: vehicle?.effective_date,
              end_date: vehicle?.end_date,
              target_id: vehicle?.vehicle?._id,
              chassis_number: vehicle?.vehicle?.chassis_number,
              reg_mark: vehicle?.vehicle?.current_reg_mark?.reg_mark,
            }
          })
        }
      }
      return []
    },
    current_vehicle: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.autotoll
      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: {
            path: 'current_vehicle',
          },
        })
        if (_doc?.current_vehicle) {
          return _doc.current_vehicle
        }
      }
      return []
    },
  },
}
