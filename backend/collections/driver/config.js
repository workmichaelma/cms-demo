export const schema = [
  {
    field: 'staff_number',
    title: '員工編號',
    type: 'text',
    placeholder: 'staff_number: ',
    is_multiple: false,
    is_required: true,
    editable: false,
  },
  {
    field: 'name',
    title: '司機英文名稱',
    type: 'text',
    placeholder: 'name e.g. Chan tai Man',
    is_required: true,
    is_multiple: false,
  },
  {
    field: 'name_tc',
    title: '司機名稱',
    type: 'text',
    placeholder: 'name_tc e.g. 陳大文',
    is_multiple: false,
  },
  {
    field: 'hkid',
    title: 'HKID',
    type: 'text',
    is_multiple: false,
    is_required: true,
    editable: false,
  },
  {
    field: 'license',
    title: '駕駛執照',
    type: 'text',
    placeholder: 'license e.g. 1 / 2 / 18 / 19',
    is_multiple: false,
    select: ['1', '2', '18', '19'],
    free_solo: false,
  },
  {
    field: 'dob',
    title: '出生日期',
    type: 'date',
    is_multiple: false,
  },
  {
    field: 'remarks',
    title: '備註',
    type: 'textarea',
  },
  {
    field: 'companies',
    title: 'Company',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: {
      company: {
        type: 'relation',
        foreign: 'company',
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
]

export const pageConfig = {
  pages: [
    {
      page: 'listing',
      fieldsToDisplay: [
        'staff_number',
        'name',
        'name_tc',
        'license',
        'dob',
        'hkid',
      ],
    },
  ],
}
