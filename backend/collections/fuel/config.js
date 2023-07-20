export const schema = [
  {
    field: 'fuel_type',
    title: '燃油種類',
    type: 'text',
    is_required: true,
    select: true,
    free_solo: true,
  },
  {
    field: 'provider',
    title: '供應商',
    type: 'text',
    select: true,
    free_solo: true,
  },
  {
    field: 'account_number',
    title: '油咭賬號',
    type: 'text',
  },
  {
    field: 'card_number',
    title: '油咭號碼',
    type: 'text',
    select: true,
    free_solo: true,
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
    field: 'current_vehicle',
    title: 'Vehicle',
    type: 'relation',
    foreign: 'vehicle',
    foreign_label: '_id',
  },
  {
    field: 'vehicles',
    title: 'Vehicle',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      vehicle: {
        type: 'relation',
        foreign: 'vehicle',
        foreign_label: '_id',
        autopopulate: true,
      },
      effective_date: {
        title: 'Installation Date',
        type: 'date',
        is_required: false,
      },
      end_date: {
        title: 'Remove Date',
        type: 'date',
        is_required: false,
      },
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
]

// export const pageConfig = {
// 	pages: {
// 		listing: {
// 			fieldsToDisplay:
// 		}
// 	}
// }
