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
    default: [],
    child: [
      {
        field: 'vehicle',
        type: 'relation',
        foreign: 'vehicle',
        foreign_label: '_id',
        autopopulate: true,
      },
      {
        field: 'effective_date',
        title: 'Installation Date',
        type: 'date',
        is_required: false,
      },
      {
        field: 'end_date',
        title: 'Remove Date',
        type: 'date',
        is_required: false,
      },
    ],
  },
  {
    field: 'current_vehicle',
    title: 'Vehicle',
    type: 'relation',
    foreign: 'vehicle',
    foreign_label: '_id',
  },
]
