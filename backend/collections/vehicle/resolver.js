import { schema } from './config.js'

export const Query = {}

export const Mutation = {}

export const Field = {
  Vehicle: {
    companies: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: { path: 'companies', populate: { path: 'company' } },
        })
        if (_doc?.companies) {
          return _doc.companies.map((doc) => {
            return {
              doc_id: doc?._id,
              target_id: doc?.company?._id,
              effective_date: doc?.effective_date,
              end_date: doc?.end_date,
              name: doc?.company?.name_tc,
              value: doc?.company?.value,
            }
          })
        }
      }
      return []
    },
    contracts: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: { path: 'contracts', populate: { path: 'contract' } },
        })
        if (_doc?.contracts) {
          return _doc.contracts.map((doc) => {
            return {
              doc_id: doc?._id,
              target_id: doc?.contract?._id,
              effective_date: doc?.effective_date,
              end_date: doc?.end_date,
              contract_number: doc?.contract?.contract_number,
            }
          })
        }
      }
      return []
    },
    reg_marks: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: { path: 'reg_marks', populate: { path: 'reg_mark' } },
        })
        if (_doc?.reg_marks) {
          return _doc.reg_marks.map((doc) => {
            return {
              doc_id: doc?._id,
              target_id: doc?.reg_mark?._id,
              effective_date: doc?.effective_date,
              end_date: doc?.end_date,
              reg_mark: doc?.reg_mark?.reg_mark,
            }
          })
        }
      }
      return []
    },
    licenses: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: {
            path: 'licenses',
            populate: {
              path: 'license',
              populate: [{ path: 'contract' }, { path: 'reg_mark' }],
            },
          },
        })
        if (_doc?.licenses) {
          return _doc.licenses.map((doc) => {
            return {
              doc_id: doc?._id,
              target_id: doc?.license?._id,
              effective_date: doc?.effective_date,
              end_date: doc?.end_date,
              license_fee: doc?.license?.license_fee,
              special_permit: doc?.license?.special_permit,
              reg_mark: doc?.license?.reg_mark?.reg_mark,
              contract_number: doc?.license?.contract?.contract_number,
            }
          })
        }
      }
      return []
    },
    permit_areas: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: {
            path: 'permit_areas',
            populate: { path: 'permit_area', populate: [{ path: 'contract' }] },
          },
        })
        if (_doc?.permit_areas) {
          return _doc.permit_areas.map((doc) => {
            return {
              doc_id: doc?._id,
              target_id: doc?.permit_area?._id,
              effective_date: doc?.effective_date,
              end_date: doc?.end_date,
              area: doc?.permit_area?.area,
              fee: doc?.permit_area?.fee,
              contract_number: doc?.permit_area?.contract?.contract_number,
            }
          })
        }
      }
      return []
    },
    insurances: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: {
            path: 'insurances',
            populate: {
              path: 'insurance',
              populate: [{ path: 'contract' }, { path: 'reg_mark' }],
            },
          },
        })
        if (_doc?.insurances) {
          return _doc.insurances.map((doc) => {
            return {
              doc_id: doc?._id,
              target_id: doc?.insurance?._id,
              effective_date: doc?.effective_date,
              end_date: doc?.end_date,
              insurance_company: doc?.insurance?.insurance_company,
              insurance_kind: doc?.insurance?.insurance_kind,
              policy_number: doc?.insurance?.policy_number,
              policy_number2: doc?.insurance?.policy_number2,
              insurance_fee: doc?.insurance?.insurance_fee,
              reg_mark: doc?.insurance?.reg_mark?.reg_mark,
              contract_number: doc?.insurance?.contract?.contract_number,
            }
          })
        }
      }
      return []
    },
    autotolls: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _docs = await Model.getAllAutoTolls({ _id: parent._id })
        if (_docs) {
          return _docs.map((doc) => {
            return {
              doc_id: doc?.vehicles?._id,
              target_id: doc?._id,
              autotoll_number: doc?.autotoll_number,
              effective_date: doc?.vehicles?.effective_date,
              end_date: doc?.vehicles?.end_date,
            }
          })
        }
      }
      return []
    },
    gpses: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _docs = await Model.getAllGpses({ _id: parent._id })
        if (_docs) {
          return _docs.map((doc) => {
            return {
              doc_id: doc?.vehicles?._id,
              target_id: doc?._id,
              gps_number: doc?.gps_number,
              charge: doc?.charge,
              effective_date: doc?.vehicles?.effective_date,
              end_date: doc?.vehicles?.end_date,
            }
          })
        }
      }
      return []
    },
    fuels: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _docs = await Model.getAllFuels({ _id: parent._id })
        if (_docs) {
          return _docs.map((doc) => {
            return {
              doc_id: doc?.vehicles?._id,
              target_id: doc?._id,
              fuel_type: doc?.fuel_type,
              provider: doc?.provider,
              account_number: doc?.account_number,
              card_number: doc?.card_number,
              effective_date: doc?.vehicles?.effective_date,
              end_date: doc?.vehicles?.end_date,
            }
          })
        }
      }
      return []
    },
    current_reg_mark: async (parent, args, contextValue, info) => {
      const Model = contextValue?.Model.vehicle
      if (parent && parent?._id) {
        const _doc = await Model.findOne({
          filter: { _id: parent?._id },
          populate: {
            path: 'current_reg_mark',
          },
        })
        if (_doc?.current_reg_mark) {
          return _doc.current_reg_mark
        }
      }
      return []
    },
  },
}
