const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const { isEmpty, isUndefined, isString, uniq } = require('lodash');

const collection_name = COLLECTIONS.DRIVER_PERMIT;
const schema = {
  driver: {
    title: '司機',
    type: 'relation',
    foreign: 'driver',
    foreign_label: '_id',
    editable: false,
  },
  company: {
    title: '公司',
    type: 'relation',
    foreign: 'company',
    foreign_label: '_id',
    editable: false,
  },
  vehicle_count: {
    title: '車輛數目',
    type: 'text',
    editable: false,
  },
  application_date: {
    title: '申請日期',
    type: 'date',
  },
  approval_date: {
    title: '獲批日期',
    type: 'date',
  },
  approval_file: {
    title: '獲批文件',
    type: 'relation',
    foreign: 'file',
    foreign_label: '_id',
    placeholder: 'approval file: ',
    default: null,
  },
  vehicles: {
    title: 'Vehicles',
    is_required: false,
    is_multiple: true,
    type: 'relation',
    foreign: 'vehicle',
    foreign_label: '_id',
    editable: false,
  },
};

const pageConfig = {
  pages: {
    listing: {
      fieldsToDisplay: {
        company: '公司簡稱',
        driver: '司機名稱',
        vehicle_count: '車輛數目',
        application_date: '申請日期',
        approval_date: '獲批日期',
      },
    },
  },
};

let Schema = Core.buildSchema(schema);

Schema.plugin(Core.updateLogPlugin);

/* Schema methods */

Schema.statics.getVehiclesByDriverAndCompany = async function ({
  driver,
  company,
}) {
  try {
    const __VEHICLE__ = require('./vehicle');
    const _vehicles = await __VEHICLE__.Model.getAllVehiclesByCompany({
      _id: company,
    });

    const _records = await this.find({
      driver: new mongoose.Types.ObjectId(driver),
    }).lean();

    const records = uniq(
      _records.reduce((acc, record) => {
        acc = [...acc, ...record.vehicles.map((vehicle) => vehicle.toString())];
        return acc;
      }, [])
    );

    return _vehicles.reduce((arr, v) => {
      const { _id } = v;
      if (!records.includes(_id.toString())) {
        arr.push(v);
      }
      return arr;
    }, []);
  } catch (err) {
    console.error(err);
    return [];
  }
};

/* Schema methods */
const Model = Core.buildModel({ schema: Schema, collection_name });
schema.status = {
  title: 'Status',
  type: 'boolean',
  is_required: true,
  editable: true,
};

module.exports = {
  Model,
  schema,
  pageConfig,
};
