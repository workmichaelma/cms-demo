export const schema = [
  {
    field: 'contracts',
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
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
  {
    field: 'permit_areas',
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
  {
    field: 'licenses',
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
      createdAt: { type: 'date', default: Date.now, editable: false },
    },
  },
]
