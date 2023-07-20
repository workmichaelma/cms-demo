export const schema = [
  {
    field: 'autotoll_number',
    title: 'Autotoll No.',
    type: 'text',
    is_required: true,
    editable: false,
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
