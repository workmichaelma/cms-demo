export const schema = [
  {
    field: 'in_charge',
    title: '負責人',
    type: 'text',
    placeholder: 'in_charge: e.g. Adam',
  },
  {
    field: 'print_number',
    title: '車身編號',
    type: 'text',
    placeholder: 'print_number: e.g. W123',
  },
  {
    field: 'chassis_number',
    title: '底盤號碼',
    type: 'text',
    placeholder: 'chassis_number: e.g. JT7X2RB8007003304',
    is_required: true,
  },
  {
    field: 'mvmd_remarks',
    title: '機械部備用車',
    placeholder: 'mvmd_remarks: ',
    type: 'text',
  },
  {
    field: 'district',
    title: '區份',
    type: 'text',
    placeholder: 'district: e.g. 馬料水 / 馬料水',
    //select: ['新界', '九龍', '香港島'],
    select: true,
    free_solo: true,
  },
  {
    field: 'usage',
    title: '使用人',
    type: 'text',
    placeholder: 'usage: (判頭/部門) e.g. 各區 / 吐露二期',
    //select: ['判頭', '部門'],
    select: true,
    free_solo: true,
  },
  {
    field: 'purpose',
    title: '用途',
    type: 'text',
    placeholder: 'purpose: e.g. 工程車',
    select: true,
    free_solo: true,
  },
  {
    field: 'type',
    title: '車種',
    type: 'text',
    placeholder: 'type: e.g. 燈車 / 水車',
    select: true,
    free_solo: true,
  },
  {
    field: 'type_detail',
    title: '車種明細',
    type: 'text',
    placeholder: 'type_detail: e.g. 16噸護航車',
    select: true,
    free_solo: true,
  },
  {
    field: 'make',
    title: '廠名',
    type: 'text',
    placeholder: 'make: e.g. ISUZU / MITSUBISHI',
    select: true,
    free_solo: true,
  },
  {
    field: 'maintainance',
    title: '承包保養',
    type: 'text',
    placeholder: 'maintainance: e.g. 新記包保養',
    select: true,
    free_solo: true,
  },
  {
    field: 'maintainance_remarks',
    title: '原廠保養備註',
    type: 'textarea',
    placeholder: 'maintainance_remarks: e.g. "森那美 3年/10萬公里"',
  },
  {
    field: 'maintainance_end_date',
    title: '原廠保養到期日',
    type: 'date',
  },
  {
    field: 'maintenance_mileage',
    title: '原廠保養里數',
    type: 'number',
    placeholder: 'maintenance_mileage: ',
    is_number_only: true,
  },
  {
    field: 'vehicle_class',
    title: '類別',
    type: 'text',
    placeholder: 'vehicle_class: e.g. Private Car / S.P.V.',
    select: true,
    free_solo: true,
  },
  {
    field: 'license',
    title: '駕駛牌照',
    type: 'text',
    placeholder: 'license: e.g. 1 / 2 / 18 / 19',
    select: true,
    free_solo: false,
    select: ['1', '2', '18', '19'],
  },
  {
    field: 'vehicle_model',
    title: '型號',
    type: 'text',
    placeholder: 'vehicle_model: e.g. PRIUS C',
    select: true,
    free_solo: true,
  },
  {
    field: 'engine_number',
    title: '引擎號碼',
    type: 'text',
    placeholder: 'engine_number: e.g. 2NZ-2997588',
  },
  {
    field: 'cylinder_capacity',
    title: '汽缸容量 (C.C)',
    type: 'text',
    placeholder: 'cylinder_capacity: e.g. 1497',
    // is_number_only: true,
    // is_positive: true,
  },
  {
    field: 'color',
    title: '顏色',
    type: 'text',
    placeholder: 'color: e.g. YELLOW',
    is_required: false,
    select: true,
    free_solo: true,
  },
  {
    field: 'body_type',
    title: '車身類型',
    type: 'text',
    placeholder: 'body_type: e.g. SALOON',
    select: true,
    free_solo: true,
  },
  {
    field: 'gross_weight',
    title: '許可車輛總重',
    type: 'text',
    placeholder: 'gross_weight: e.g. 3.8 / 5.5 / 16 / 38',
    // is_number_only: true,
    // is_positive: true,
  },
  {
    field: 'registered_owner',
    title: '登記車主',
    type: 'text',
    placeholder: 'registered_owner: e.g. 偉金建築',
    select: true,
    free_solo: true,
  },
  {
    field: 'owner_registration_date',
    title: '登記車主日期',
    type: 'date',
    is_multiple: false,
  },
  {
    field: 'manufacture_year',
    title: '出廠年份',
    type: 'number',
    // regExp: '^(19[0-9][0-9]|20[0-1][0-9]|209[0-9])$',
    placeholder: 'manufacture_year: e.g. 2008',
    // is_number_only: true,
    // maxlength: 4,
  },
  {
    field: 'first_registration_date',
    title: '首次登記日期',
    type: 'date',
    is_multiple: false,
  },
  {
    field: 'car_loan',
    title: '上會',
    type: 'text',
    placeholder: 'car_loan: e.g. XX銀行',
  },
  {
    field: 'gratia_payment_scheme',
    title: '歐盟資助',
    type: 'text',
    placeholder: 'gratia_payment_scheme: ',
    default: false,
  },
  {
    field: 'rearview_mirror',
    title: '後視鏡',
    // type: 'boolean',
    type: 'text',
    placeholder: 'rearview_mirror: e.g. Y / N',
    default: false,
  },
  {
    field: 'spare_key',
    title: '後備匙',
    type: 'text',
    placeholder: 'spare_key: e.g. Y / N',
    default: false,
  },
  {
    field: 'new_car',
    title: '新車',
    type: 'text',
    placeholder: 'new_car: ',
    default: false,
  },
  {
    field: 'remarks',
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
  },
  {
    field: 'current_reg_mark',
    title: '車牌號碼',
    type: 'relation',
    foreign: 'reg_mark',
    foreign_label: '_id',
  },
  {
    field: 'companies',
    title: 'Company',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: [
      {
        field: 'company',
        type: 'relation',
        foreign: 'company',
        foreign_label: '_id',
        autopopulate: true,
      },
      {
        field: 'value',
        title: 'Value',
        type: 'text',
        is_required: false,
        is_positive: true,
      },
      {
        field: 'effective_date',
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      {
        field: 'end_date',
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
    ],
  },
  {
    field: 'contracts',
    title: 'Contract',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: [
      {
        field: 'contract',
        type: 'relation',
        foreign: 'contract',
        foreign_label: '_id',
        autopopulate: true,
      },
      {
        field: 'effective_date',
        title: 'Start Date',
        type: 'date',
        is_required: false,
      },
      {
        field: 'end_date',
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
    ],
  },
  {
    field: 'contract_deducts',
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
  {
    field: 'insurances',
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
  {
    field: 'fuels',
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
  {
    field: 'licenses',
    title: 'License',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: [
      {
        field: 'license',
        type: 'relation',
        foreign: 'license',
        foreign_label: '_id',
        autopopulate: true,
      },
      {
        field: 'effective_date',
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      {
        field: 'end_date',
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
    ],
  },
  {
    field: 'permit_areas',
    title: 'Permit Area',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: [
      {
        field: 'permit_area',
        type: 'relation',
        foreign: 'permit_area',
        foreign_label: '_id',
        autopopulate: true,
      },
      {
        field: 'effective_date',
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      {
        field: 'end_date',
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
    ],
  },
  {
    field: 'reg_marks',
    title: 'Reg Mark',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    default: [],
    child: [
      {
        field: 'reg_mark',
        type: 'relation',
        foreign: 'reg_mark',
        foreign_label: '_id',
        autopopulate: true,
      },
      {
        field: 'effective_date',
        title: 'Effective Date',
        type: 'date',
        is_required: false,
      },
      {
        field: 'end_date',
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
    ],
  },
]

export const pageConfig = {
  pages: {
    listing: {
      fieldsToDisplay: [
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
        'reg_mark',
        'status',
      ],
    },
    profile: [
      {
        page: 'general',
        fieldsToDisplay: [
          'status',
          'chassis_number',
          'color',
          'body_type',
          'car_loan',
          'in_charge',
          'print_number',
          'mvmd_remarks',
          'district',
          'usage',
          'purpose',
          'type',
          'type_detail',
          'make',
          'maintainance',
          'maintainance_remarks',
          'maintainance_end_date',
          'maintenance_mileage',
          'vehicle_class',
          'license',
          'vehicle_model',
          'engine_number',
          'cylinder_capacity',
          'gross_weight',
          'registered_owner',
          'owner_registration_date',
          'manufacture_year',
          'first_registration_date',
          'gratia_payment_scheme',
          'rearview_mirror',
          'spare_key',
          'new_car',
          'remarks',
        ],
      },
    ],
  },
}
