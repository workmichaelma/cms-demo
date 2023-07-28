export const schema = [
  {
    field: 'reg_mark',
    title: '車牌',
    type: 'text',
    is_multiple: false,
    is_required: true,
    editable: false,
  },
  {
    field: 'effective_date',
    title: '生效日期',
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
    field: 'company',
    title: '公司',
    type: 'relation',
    foreign: 'company',
    foreign_label: '_id',
  },
  {
    field: 'current_vehicle',
    title: 'Vehicle',
    type: 'relation',
    foreign: 'vehicle',
    foreign_label: '_id',
  },
]

export const pageConfig = {
  pages: [
    {
      page: 'listing',
      fieldsToDisplay: ['reg_mark'],
    },
  ],
}
