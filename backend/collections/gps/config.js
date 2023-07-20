export const schema = [
  {
    field: 'gps_number',
    title: 'GPS No.',
    type: 'text',
    is_required: true,
    editable: false,
  },
  {
    field: 'charge',
    title: '每月費用',
    type: 'text',
    is_number_only: true,
    is_positive: true,
    show_dollar: true,
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
  {
    field: 'current_vehicle',
    title: 'Vehicle',
    type: 'relation',
    foreign: 'vehicle',
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
