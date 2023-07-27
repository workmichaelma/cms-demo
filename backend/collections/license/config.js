export const schema = [
  {
    field: 'license_fee',
    title: '牌費',
    type: 'number',
    is_number_only: true,
    is_positive: true,
    is_required: true,
    show_dollar: true,
  },
  {
    field: 'permit_fee',
    title: '特別許可費',
    type: 'number',
    is_number_only: true,
    is_positive: true,
    show_dollar: true,
  },
  {
    field: 'special_permit',
    title: '特別許可證',
    type: 'text',
    // is_required: true,
  },
  {
    field: 'remarks',
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
  },
  {
    field: 'effective_date',
    title: '續牌日期',
    type: 'date',
    is_multiple: false,
  },
  {
    field: 'end_date',
    title: '結束日期',
    type: 'date',
    is_multiple: false,
  },
  {
    field: 'contract',
    type: 'relation',
    foreign: 'contract',
    foreign_label: '_id',
  },
  {
    field: 'reg_mark',
    title: '車牌',
    type: 'relation',
    foreign: 'reg_mark',
    foreign_label: '_id',
  },
]

export const pageConfig = {
  pages: [
    {
      page: 'listing',
      fieldsToDisplay: [
        '_id',
        'license_fee',
        'permit_fee',
        'special_fee',
        'effective_date',
        'end_date',
        'contract_number',
        'reg_mark',
      ],
    },
  ],
}
