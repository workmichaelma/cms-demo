export const schema = [
  {
    field: 'area',
    title: '許可區',
    type: 'text',
    is_required: true,
    select: true,
    free_solo: true,
    editable: false,
  },
  {
    field: 'fee',
    title: '費用',
    type: 'number',
    is_number_only: true,
  },
  {
    field: 'remarks',
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
  },
  {
    field: 'effective_date',
    title: '生效日期',
    type: 'date',
  },
  {
    field: 'end_date',
    title: '結束日期',
    type: 'date',
  },
  {
    field: 'contract',
    type: 'relation',
    foreign: 'contract',
    foreign_label: '_id',
  },
]

// export const pageConfig = {
// 	pages: {
// 		listing: {
// 			fieldsToDisplay:
// 		}
// 	}
// }
