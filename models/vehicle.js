const Core = require(_base + 'app/models/core');
const mongoose = require('mongoose');
const { COLLECTIONS } = require(_base + 'app/config/config');
const {
  isArray,
  isEmpty,
  isString,
  isUndefined,
  last,
  get,
} = require('lodash');
const {
  checkFieldIsValid,
  withSchemaField,
  withVehicleField,
  withProfileFieldsToDisplay,
  buildUpdate,
} = require('../helpers/common');

const collection_name = COLLECTIONS.VEHICLE;

const schema = {
  in_charge: {
    title: '負責人',
    type: 'text',
    placeholder: 'in_charge: e.g. Adam',
  },
  print_number: {
    title: '車身編號',
    type: 'text',
    placeholder: 'print_number: e.g. W123',
  },
  chassis_number: {
    title: '底盤號碼',
    type: 'text',
    placeholder: 'chassis_number: e.g. JT7X2RB8007003304',
    is_required: true,
  },
  mvmd_remarks: {
    title: '機械部備用車',
    placeholder: 'mvmd_remarks: ',
    type: 'text',
  },
  district: {
    title: '區份',
    type: 'text',
    placeholder: 'district: e.g. 馬料水 / 馬料水',
    //select: ['新界', '九龍', '香港島'],
    select: true,
    free_solo: true,
  },
  usage: {
    title: '使用人',
    type: 'text',
    placeholder: 'usage: (判頭/部門) e.g. 各區 / 吐露二期',
    //select: ['判頭', '部門'],
    select: true,
    free_solo: true,
  },
  purpose: {
    title: '用途',
    type: 'text',
    placeholder: 'purpose: e.g. 工程車',
    select: true,
    free_solo: true,
  },
  type: {
    title: '車種',
    type: 'text',
    placeholder: 'type: e.g. 燈車 / 水車',
    select: true,
    free_solo: true,
  },
  type_detail: {
    title: '車種明細',
    type: 'text',
    placeholder: 'type_detail: e.g. 16噸護航車',
    select: true,
    free_solo: true,
  },
  make: {
    title: '廠名',
    type: 'text',
    placeholder: 'make: e.g. ISUZU / MITSUBISHI',
    select: true,
    free_solo: true,
  },
  maintainance: {
    title: '承包保養',
    type: 'text',
    placeholder: 'maintainance: e.g. 新記包保養',
    select: true,
    free_solo: true,
  },
  maintainance_remarks: {
    title: '原廠保養備註',
    type: 'textarea',
    placeholder: 'maintainance_remarks: e.g. "森那美 3年/10萬公里"',
  },
  maintainance_end_date: {
    title: '原廠保養到期日',
    type: 'date',
  },
  maintenance_mileage: {
    title: '原廠保養里數',
    type: 'number',
    placeholder: 'maintenance_mileage: ',
    is_number_only: true,
  },
  vehicle_class: {
    title: '類別',
    type: 'text',
    placeholder: 'vehicle_class: e.g. Private Car / S.P.V.',
    select: true,
    free_solo: true,
  },
  license: {
    title: '駕駛牌照',
    type: 'text',
    placeholder: 'license: e.g. 1 / 2 / 18 / 19',
    select: true,
    free_solo: false,
    select: ['1', '2', '18', '19'],
  },
  vehicle_model: {
    title: '型號',
    type: 'text',
    placeholder: 'vehicle_model: e.g. PRIUS C',
    select: true,
    free_solo: true,
  },
  engine_number: {
    title: '引擎號碼',
    type: 'text',
    placeholder: 'engine_number: e.g. 2NZ-2997588',
  },
  cylinder_capacity: {
    title: '汽缸容量 (C.C)',
    type: 'text',
    placeholder: 'cylinder_capacity: e.g. 1497',
    // is_number_only: true,
    // is_positive: true,
  },
  color: {
    title: '顏色',
    type: 'text',
    placeholder: 'color: e.g. YELLOW',
    is_required: false,
    select: true,
    free_solo: true,
  },
  body_type: {
    title: '車身類型',
    type: 'text',
    placeholder: 'body_type: e.g. SALOON',
    select: true,
    free_solo: true,
  },
  gross_vehicle_weight: {
    title: '許可車輛總重',
    type: 'text',
    placeholder: 'gross_vehicle_weight: e.g. 3.8 / 5.5 / 16 / 38',
    // is_number_only: true,
    // is_positive: true,
  },
  registered_owner: {
    title: '登記車主',
    type: 'text',
    placeholder: 'registered_owner: e.g. 偉金建築',
    select: true,
    free_solo: true,
  },
  owner_registration_date: {
    title: '登記車主日期',
    type: 'date',
    is_multiple: false,
  },
  manufacture_year: {
    title: '出廠年份',
    type: 'number',
    // regExp: '^(19[0-9][0-9]|20[0-1][0-9]|209[0-9])$',
    placeholder: 'manufacture_year: e.g. 2008',
    // is_number_only: true,
    // maxlength: 4,
  },
  first_registration_date: {
    title: '首次登記日期',
    type: 'date',
    is_multiple: false,
  },
  car_loan: {
    title: '上會',
    type: 'text',
    placeholder: 'car_loan: e.g. XX銀行',
  },
  gratia_payment_scheme: {
    title: '歐盟資助',
    type: 'text',
    placeholder: 'gratia_payment_scheme: ',
    default: false,
  },
  rearview_mirror: {
    title: '後視鏡',
    // type: 'boolean',
    type: 'text',
    placeholder: 'rearview_mirror: e.g. Y / N',
    default: false,
  },
  spare_key: {
    title: '後備匙',
    type: 'text',
    placeholder: 'spare_key: e.g. Y / N',
    default: false,
  },
  new_car: {
    title: '新車',
    type: 'text',
    placeholder: 'new_car: ',
    default: false,
  },
  remarks: {
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
  },
  current_reg_mark: {
    title: '車牌號碼',
    type: 'relation',
    foreign: 'reg_mark',
    foreign_label: '_id',
  },
  companies: {
    title: 'Company',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      company: {
        type: 'relation',
        foreign: 'company',
        foreign_label: '_id',
        autopopulate: true,
      },
      value: {
        title: 'Value',
        type: 'text',
        is_required: false,
        is_positive: true,
      },
      effective_date: {
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  contracts: {
    title: 'Contract',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      contract: {
        type: 'relation',
        foreign: 'contract',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Start Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  contract_deducts: {
    title: 'Contract Deduct',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      contract_deduct: {
        type: 'relation',
        foreign: 'contract_deduct',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Start Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  insurances: {
    title: 'Insurance',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      insurance: {
        type: 'relation',
        foreign: 'insurance',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  fuels: {
    title: 'Fuel',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      fuel: {
        type: 'relation',
        foreign: 'fuel',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  licenses: {
    title: 'License',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      license: {
        type: 'relation',
        foreign: 'license',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  permit_areas: {
    title: 'Permit Area',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      permit_area: {
        type: 'relation',
        foreign: 'permit_area',
        foreign_label: '_id',
        autopopulate: true,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  reg_marks: {
    title: 'Reg Mark',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      reg_mark: {
        type: 'relation',
        foreign: 'reg_mark',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
};

const pageConfig = {
  pages: {
    listing: {
      fieldsToDisplay: {
        ...withSchemaField(schema, [
          'in_charge',
          'chassis_number',
          'print_number',
          'type',
          'purpose',
          'make',
          'vehicle_class',
          'license',
          'color',
          'manufacture_year',
          'current_reg_mark',
          'status',
        ]),
      },
    },
    profile: {
      fieldsToDisplay: ['status', ...withProfileFieldsToDisplay(schema)],
    },
  },
};

let Schema = Core.buildSchema(schema);
Schema = Core.buildCustomInputVirtualFields(Schema, [
  'type',
  'company_id',
  'company_effective_date',
  'company_end_date',
  'company_value',
  'contract_id',
  'contract_effective_date',
  'contract_end_date',
  'contract_deduct_id',
  'contract_deduct_effective_date',
  'contract_deduct_end_date',
  'permit_area_permit_area',
  'license_license',
  'insurance_insurance',
]);
Schema.plugin(Core.updateLogPlugin);

Schema.index({
  print_number: -1,
  chassis_number: -1,
  current_reg_mark: -1,
});

Schema.virtual('current_company').get(function () {
  if (isArray(this.companies) && !isEmpty(this.companies)) {
    return this.companies.slice(-1)[0];
  }
  return null;
});

Schema.virtual('current_contract').get(function () {
  if (isArray(this.contracts) && !isEmpty(this.contracts)) {
    return this.contracts.slice(-1)[0];
  }
  return null;
});

/* Schema methods */

// Update record
Schema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate();

    // // Update latest company data
    // if (update['input__company_object_id']) {
    // 	if (update['input__company_effective_date']) {
    // 		update.$set['companies.$[companies].effective_date'] =
    // 			update['input__company_effective_date'];
    // 	}
    // 	if (update['input__company_end_date']) {
    // 		update.$set['companies.$[companies].end_date'] =
    // 			update['input__company_end_date'];
    // 	}
    // 	if (update['input__company_value']) {
    // 		update.$set['companies.$[companies].value'] =
    // 			update['input__company_value'];
    // 	}

    // 	this.setOptions({
    // 		arrayFilters: [{ 'companies._id': update['input__company_object_id'] }],
    // 	});
    // 	// Add a new company record
    // } else if (!isUndefined(update['input__company_id'])) {
    // 	update.$push = {};
    // 	update.$push['companies'] = {
    // 		company: update['input__company_id']
    // 			? new mongoose.Types.ObjectId(update['input__company_id'])
    // 			: undefined,
    // 		effective_date: update['input__company_effective_date'] || undefined,
    // 		end_date: update['input__company_end_date'] || undefined,
    // 		value: update['input__company_value'] || undefined,
    // 	};
    // }
    if (
      !isUndefined(update['input__contract_deduct_id']) &&
      update['input__type'] === 'add'
    ) {
      const __CONTRACT_DEDUCT__ = require('./contract_deduct');
      const _doc = await __CONTRACT_DEDUCT__.Model.create({
        input__contract_id: update['input__contract_deduct_id'],
      });
      update['input__contract_deduct_id'] = _doc._id;
    }

    await Core.buildUpdate({
      _this: this,
      update,
      fields: ['effective_date', 'end_date'],
      arr_name: 'contract_deducts',
      key_name: 'contract_deduct',
    });

    await Core.buildUpdate({
      _this: this,
      update,
      fields: ['effective_date', 'end_date', 'value'],
      arr_name: 'companies',
      key_name: 'company',
    });

    await Core.buildUpdate({
      _this: this,
      update,
      fields: ['effective_date', 'end_date'],
      arr_name: 'contracts',
      key_name: 'contract',
    });

    if (
      update['input__reg_mark_object_id'] &&
      update['input__reg_mark_reg_mark'] &&
      update['input__type'] === 'delete'
    ) {
      update.$unset = {
        ...(update.$unset || {}),
        current_reg_mark: 1,
      };
    }

    if (update['input__reg_mark_id'] && update['input__type'] === 'add') {
      update.current_reg_mark = new mongoose.Types.ObjectId(
        update['input__reg_mark_id']
      );
    }

    await Core.buildUpdate({
      _this: this,
      update,
      fields: ['effective_date', 'end_date'],
      arr_name: 'reg_marks',
      key_name: 'reg_mark',
    });

    if (
      update['input__permit_area_object_id'] &&
      update['input__permit_area_permit_area'] &&
      update['input__type'] === 'delete'
    ) {
      const __PERMIT_AREA__ = require('./permit_area');
      await __PERMIT_AREA__.Model.deleteOne({
        _id: new mongoose.Types.ObjectId(
          update['input__permit_area_permit_area']
        ),
      });
    }

    await Core.buildUpdate({
      _this: this,
      update,
      fields: ['effective_date', 'end_date'],
      arr_name: 'permit_areas',
      key_name: 'permit_area',
    });

    if (
      update['input__license_object_id'] &&
      update['input__license_license'] &&
      update['input__type'] === 'delete'
    ) {
      const __LICENSE__ = require('./license');
      await __LICENSE__.Model.deleteOne({
        _id: new mongoose.Types.ObjectId(update['input__license_license']),
      });
    }

    await Core.buildUpdate({
      _this: this,
      update,
      fields: ['effective_date', 'end_date'],
      arr_name: 'licenses',
      key_name: 'license',
    });

    if (
      update['input__insurance_object_id'] &&
      update['input__insurance_insurance'] &&
      update['input__type'] === 'delete'
    ) {
      const __INSURANCE__ = require('./insurance');
      await __INSURANCE__.Model.deleteOne({
        _id: new mongoose.Types.ObjectId(update['input__insurance_insurance']),
      });
    }

    await Core.buildUpdate({
      _this: this,
      update,
      fields: ['effective_date', 'end_date'],
      arr_name: 'insurances',
      key_name: 'insurance',
    });

    // Update contract data
    // if (update['input__contract_object_id']) {
    // 	if (update['input__type'] === 'delete') {
    // 		update.$pull = {
    // 			contracts: {
    // 				_id: new mongoose.Types.ObjectId(
    // 					update['input__contract_object_id']
    // 				),
    // 			},
    // 		};
    // 	} else {
    // 		if (update['input__contract_effective_date']) {
    // 			update.$set['contracts.$[contracts].effective_date'] =
    // 				update['input__contract_effective_date'];
    // 		} else if (update['input__contract_effective_date'] === null) {
    // 			update.$unset = {
    // 				...update.$unset,
    // 				['contracts.$[contracts].effective_date']: 1,
    // 			};
    // 		}
    // 		if (update['input__contract_end_date']) {
    // 			update.$set['contracts.$[contracts].end_date'] =
    // 				update['input__contract_end_date'];
    // 		}
    // 		this.setOptions({
    // 			arrayFilters: [
    // 				{ 'contracts._id': update['input__contract_object_id'] },
    // 			],
    // 		});
    // 	}

    // 	// Add a new contract record
    // } else if (!isUndefined(update['input__contract_id'])) {
    // 	update.$push = {
    // 		...(update.$push || {}),
    // 	};
    // 	update.$push['contracts'] = {
    // 		contract: update['input__contract_id']
    // 			? new mongoose.Types.ObjectId(update['input__contract_id'])
    // 			: undefined,
    // 		effective_date: update['input__contract_effective_date'] || undefined,
    // 		end_date: update['input__contract_end_date'] || undefined,
    // 	};
    // }

    // Update latest contract_deduct data
    // if (update['input__contract_deduct_object_id']) {
    // 	if (update['input__contract_deduct_effective_date']) {
    // 		update.$set['contract_deducts.$[element].effective_date'] =
    // 			update['input__contract_deduct_effective_date'];
    // 	}
    // 	if (update['input__contract_deduct_end_date']) {
    // 		update.$set['contract_deducts.$[element].end_date'] =
    // 			update['input__contract_deduct_end_date'];
    // 	}

    // 	this.setOptions({
    // 		arrayFilters: [
    // 			{
    // 				'element._id': new mongoose.Types.ObjectId(
    // 					update['input__contract_deduct_object_id']
    // 				),
    // 			},
    // 		],
    // 	});
    // 	// Add a new contract_deduct record
    // } else if (!isUndefined(update['input__contract_deduct_id'])) {
    // 	const __CONTRACT_DEDUCT__ = require('./contract_deduct');
    // 	const _doc = await __CONTRACT_DEDUCT__.Model.create({
    // 		input__contract_id: update['input__contract_deduct_id'],
    // 	});
    // 	update.$push = {
    // 		...(update.$push || {}),
    // 	};
    // 	update.$push['contract_deducts'] = {
    // 		contract_deduct: _doc._id,
    // 		effective_date:
    // 			update['input__contract_deduct_effective_date'] || undefined,
    // 		end_date: update['input__contract_deduct_end_date'] || undefined,
    // 	};
    // }
    next();
  } catch (err) {
    console.error(err);
  }
});

// Create new record
Schema.pre('save', function (next) {
  try {
    const {
      input__company_id,
      input__company_effective_date,
      input__company_end_date,
      input__contract_id,
      input__contract_effective_date,
      input__contract_end_date,
    } = this;
    if (input__company_id && isString(input__company_id)) {
      this.companies = [
        {
          company: input__company_id,
          effective_date: input__company_effective_date,
          end_date: input__company_end_date,
        },
      ];
    }
    if (input__contract_id && isString(input__contract_id)) {
      this.contracts = [
        {
          contract: input__contract_id,
          effective_date: input__contract_effective_date,
          end_date: input__contract_end_date,
        },
      ];
    }
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
});

Schema.statics.getAllAutotolls = async ({ _id }) => {
  const __AUTOTOLL__ = require(_base + 'app/models/autotoll');
  try {
    const query = [
      {
        $match: {
          'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $unwind: '$vehicles',
      },
      {
        $match: {
          'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $sort: {
          'vehicles.updatedAt': 1,
        },
      },
    ];

    const _doc = await __AUTOTOLL__.Model.aggregate(query);

    if (_doc) {
      return { _doc };
    } else {
      throw new Error('No Record Found.');
    }
  } catch (err) {
    console.log(`Failed to getAllAutotolls, reason: ${err}`);
    return { err };
  }
};

Schema.statics.getAllGpses = async ({ _id }) => {
  const __GPS__ = require(_base + 'app/models/gps');
  try {
    const query = [
      {
        $match: {
          'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $unwind: '$vehicles',
      },
      {
        $match: {
          'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $sort: {
          'vehicles.updatedAt': 1,
        },
      },
    ];

    const _doc = await __GPS__.Model.aggregate(query);

    if (_doc) {
      return { _doc };
    } else {
      throw new Error('No Record Found.');
    }
  } catch (err) {
    console.log(`Failed to getAllGpses, reason: ${err}`);
    return { err };
  }
};

Schema.statics.getAllFuels = async ({ _id }) => {
  const __FUEL__ = require(_base + 'app/models/fuel');
  try {
    const query = [
      {
        $match: {
          'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $unwind: '$vehicles',
      },
      {
        $match: {
          'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $sort: {
          'vehicles.updatedAt': 1,
        },
      },
    ];

    const _doc = await __FUEL__.Model.aggregate(query);

    if (_doc) {
      return { _doc };
    } else {
      throw new Error('No Record Found.');
    }
  } catch (err) {
    console.log(`Failed to getAllFuels, reason: ${err}`);
    return { err };
  }
};

Schema.statics.getAllDrivers = async ({ _id }) => {
  const __DRIVER__ = require(_base + 'app/models/driver');
  try {
    const query = [
      {
        $match: {
          'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $unwind: '$vehicles',
      },
      {
        $match: {
          'vehicles.vehicle': new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $sort: {
          'vehicles.updatedAt': 1,
        },
      },
    ];

    const _doc = await __DRIVER__.Model.aggregate(query);

    if (_doc) {
      return { _doc };
    } else {
      throw new Error('No Record Found.');
    }
  } catch (err) {
    console.log(`Failed to getAllDrivers, reason: ${err}`);
    return { err };
  }
};

Schema.statics.getAllContractDeducts = async ({ _id }) => {
  const __VEHICLE__ = require(_base + 'app/models/vehicle');
  try {
    const query = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $unwind: '$contract_deducts',
      },
      {
        $addFields: {
          effective_date: '$contract_deducts.effective_date',
          end_date: '$contract_deducts.end_date',
        },
      },
      {
        $lookup: {
          from: 'contract_deducts',
          localField: 'contract_deducts.contract_deduct',
          foreignField: '_id',
          as: 'contract_deduct',
        },
      },
      {
        $unwind: '$contract_deduct',
      },
      {
        $sort: {
          'contract_deduct._id': -1,
        },
      },
      {
        $project: {
          contract_deduct: '$contract_deduct',
          effective_date: '$effective_date',
          end_date: '$end_date',
          _id: '$contract_deducts._id',
        },
      },
      {
        $lookup: {
          from: 'contracts',
          localField: 'contract_deduct.contracts.contract',
          foreignField: '_id',
          as: 'contract',
        },
      },
      {
        $addFields: {
          'contract_deduct.contract_number': {
            $first: '$contract.contract_number',
          },
        },
      },
      {
        $project: {
          contract_deduct: {
            _id: '$contract_deduct._id',
            contract_number: '$contract_deduct.contract_number',
          },
          effective_date: '$effective_date',
          end_date: '$end_date',
        },
      },
    ];

    const _doc = await __VEHICLE__.Model.aggregate(query);

    if (_doc) {
      return { _doc };
    } else {
      throw new Error('No Record Found.');
    }
  } catch (err) {
    console.log(`Failed to getAllDrivers, reason: ${err}`);
    return { err };
  }
};

Schema.statics.getVehicleByRegMark = async function ({ reg_mark }) {
  try {
    const __REG_MARK__ = require(_base + 'app/models/reg_mark');
    const _doc = await __REG_MARK__.Model.findOne({
      reg_mark,
    }).lean();
    if (_doc) {
      return this.findOne({ current_reg_mark: _doc._id });
    }
  } catch (err) {
    console.error(`Failed to getVehicleByRegMark, reason: ${err}`);
    return null;
  }
};

Schema.statics.getCurrentRegMark = async ({ _id, _doc }) => {
  try {
    let reg_mark = null;
    if (_doc) {
      reg_mark = last(_doc?.reg_marks);
    }
    if (reg_mark) {
      const __REG_MARK__ = require('./reg_mark');
      const reg_mark_current_vehicle =
        await __REG_MARK__.Model.getCurrentVehicle({
          _id: new mongoose.Types.ObjectId(reg_mark.reg_mark),
        });

      if (_doc._id.equals(reg_mark_current_vehicle?.vehicle?._id)) {
        return reg_mark;
      }
    }
    return null;
  } catch (err) {
    console.error(`Failed to getCurrentRegMark, reason: ${err}`);
  }
};

Schema.statics.getAllVehiclesByCompany = async function ({ _id }) {
  try {
    const _docs = await this.find({
      $expr: {
        $eq: [
          { $arrayElemAt: ['$companies.company', -1] },
          new mongoose.Types.ObjectId(_id),
        ],
      },
    }).populate('current_reg_mark');
    return _docs;
  } catch (err) {
    console.error(err);
    return [];
  }
};

Schema.statics.import = async function ({ body }) {
  try {
    const requests = [];
    for (const row of body) {
      try {
        const update = {};
        const { error, fields } = checkFieldIsValid({ schema, args: row });
        const { chassis_number, ...args } = fields;

        if (isEmpty(error)) {
          update.$set = args;
          const doc = await this.findOneAndUpdate({ chassis_number }, update, {
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
