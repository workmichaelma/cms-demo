export const schema = [
  {
    field: 'insurance_company',
    title: '投保公司',
    type: 'text',
    is_required: true,
    select: true,
    free_solo: true,
    editable: false,
  },
  {
    field: 'insurance_kind',
    title: '保單種類',
    type: 'text',
  },
  {
    field: 'policy_number',
    title: '保單編號',
    type: 'text',
    is_required: true,
    editable: false,
  },
  {
    field: 'policy_number2',
    title: '保單編號 (中港)',
    type: 'text',
  },
  {
    field: 'insurance_fee',
    title: '保費',
    type: 'number',
    show_dollar: true,
  },
  {
    field: 'remarks',
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks:',
  },
  {
    field: 'effective_date',
    title: '承保日期',
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
      fieldsToDisplay: [],
    },
  ],
}
