export const schema = [
  {
    field: 'contract_number',
    title: '合約編號',
    type: 'text',
    placeholder: 'contract_number: eg. 05/HY/2018',
    is_required: true,
    editable: false,
    unique_key: true,
  },
  {
    field: 'short_name',
    title: '合約概要',
    type: 'text',
    placeholder: 'short_name: eg. 大埔及北區',
  },
  {
    field: 'title',
    title: '合約英文名稱',
    type: 'text',
    placeholder:
      'title: eg. Highways Department Term Contract (Management and Maintenance of Roads in Tai Po and North Districts ...',
  },
  {
    field: 'title_tc',
    title: '合約名稱',
    type: 'text',
    placeholder: 'title_tc: eg. 路政署定期合約（大埔及北區道路 ...',
  },
  {
    field: 'remarks',
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
  },
  {
    field: 'effective_date',
    title: '合約生效日期',
    type: 'date',
  },
  {
    field: 'end_date',
    title: '合約結束日期',
    type: 'date',
  },
  {
    field: 'contract_deducts',
    title: 'Contract Deduct',
    is_required: false,
    is_multiple: true,
    type: 'object',
    autopopulate: true,
    child: [
      {
        field: 'contract_deduct',
        type: 'relation',
        foreign: 'contract_deduct',
        foreign_label: '_id',
        autopopulate: true,
      },
      {
        field: 'effective_date',
        title: 'Start Date',
        type: 'date',
        is_required: false,
      },
      {
        field: 'end_date',
        title: 'End Date',
        type: 'date',
        is_required: false,
      },
    ],
  },
]

export const pageConfig = {
  pages: [
    {
      page: 'listing',
      fieldsToDisplay: [
        'contract_number',
        'short_name',
        'effective_date',
        'end_date',
        'status',
      ],
    },
  ],
}
