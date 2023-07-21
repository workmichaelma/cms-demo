import mongoose from 'mongoose'
import lodash from 'lodash'
import { Model } from '#_/lib/model.js'
import { schema } from './config.js'

import { checkFieldIsValidToSchema } from '#_/lib/common.js'

const {isEmpty} = lodash
export class Autotoll extends Model {
	constructor() {
		super('autotoll', schema)
		super.buildModel()
	}

  async import ({body}) {
    try {
      const requests = [];

      const items = reduce(body, (obj, row, key) => {
        const { error, fields } = checkFieldIsValidToSchema({ schema, args: row });
        const { vehicle, vehicle_effective_date, vehicle_end_date, autotoll_number } = fields;

        if (!isEmpty(error) && vehicle) {
          const vehicleObj = {
            vehicle: new mongoose.Types.ObjectId(vehicle),
            effective_date: vehicle_effective_date,
            end_date: vehicle_end_date,
          }
          if (obj[autotoll_number]) {
            obj[autotoll_number] = {
              vehicles: [
                ...obj[autotoll_number].vehicles,
                vehicleObj
              ]
            }
          } else {
            obj[autotoll_number] = {
              vehicles: [
                vehicleObj
              ],
            }
          }
        }
        return obj
      }, {})

      for (const row of body) {
        
      }

      for (const row of body) {
        try {
          const update = {};
          const { error, fields } = checkFieldIsValidToSchema({ schema, args: row });
          const { vehicle, effective_date, end_date, ...args } = fields;
  
          if (isEmpty(error) && vehicle) {
            const vehicleId = vehicle
              ? new mongoose.Types.ObjectId(vehicle)
              : null;
            update.$set = {
              ...args,
              current_vehicle: vehicleId,
            };
            if (vehicleId) {
              await this.updateMany(
                { current_vehicle: vehicleId },
                { $unset: { current_vehicle: 1 } }
              );
              update.$push = {
                vehicles: {
                  vehicle: vehicleId,
                  effective_date: effective_date || dayjs('2023-1-1'),
                  end_date,
                },
              };
            }
            const { autotoll_number } = args;
            const doc = await this.findOneAndUpdate({ autotoll_number }, update, {
              upsert: true,
              new: true,
            });
  
            requests.push({
              err: false,
              doc,
            });
          } else {
            requests.push({
              err: true,
              error,
            });
          }
        } catch (err) {
          console.error(`Failed to update/insert data, reason: ${err}`);
          return null;
        }
      }
  
      const _docs = await Promise.all(requests);
  
      return {
        _docs,
      };
    } catch (err) {
      console.error(`Failed to import, reason: ${err}`);
      return {
        err,
      };
    }
  }
}
