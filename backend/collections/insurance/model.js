import { Model } from '#_/lib/model.js'
import { encrypt, decrypt } from '#_/lib/crypto.js'
import { schema, pageConfig } from './config.js'

export class Insurance extends Model {
  constructor() {
    super('insurance', schema, pageConfig)
    super.buildModel()
  }

  async listing(props) {
    const { filter } = props

    const customFilterFields = ['contract_number', 'reg_mark']

    const searchPipeline = [
      {
        $lookup: {
          from: 'reg_marks',
          localField: 'reg_mark',
          foreignField: '_id',
          as: 'reg_mark',
        },
      },
      {
        $addFields: {
          reg_mark: {
            $first: '$reg_mark',
          },
        },
      },
      {
        $addFields: {
          reg_mark: '$reg_mark.reg_mark',
        },
      },
      {
        $lookup: {
          from: 'contracts',
          localField: 'contract',
          foreignField: '_id',
          as: 'contract',
        },
      },
      {
        $addFields: {
          contract: {
            $first: '$contract',
          },
        },
      },
      {
        $addFields: {
          contract_number: '$contract.contract_number',
        },
      },
    ]

    return await super.listing(props, { searchPipeline })
  }
}
