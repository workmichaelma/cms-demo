export const schema = [
  {
    field: 'application_date',
    title: '申請日期',
    type: 'date',
  },
  {
    field: 'approval_date',
    title: '獲批日期',
    type: 'date',
  },
  {
    field: 'vehicle_count',
    title: '車輛數目',
    type: 'text',
    editable: false,
  },
  {
    field: 'approval_file',
    title: '獲批文件',
    type: 'relation',
    foreign: 'file',
    foreign_label: '_id',
    placeholder: 'approval file: ',
    default: null,
  },
  {
    field: 'driver',
    title: '司機',
    type: 'relation',
    foreign: 'driver',
    foreign_label: '_id',
    editable: false,
  },
  {
    field: 'company',
    title: '公司',
    type: 'relation',
    foreign: 'company',
    foreign_label: '_id',
    editable: false,
  },
  {
    field: 'vehicles',
    title: 'Vehicles',
    is_required: false,
    is_multiple: true,
    type: 'relation',
    foreign: 'vehicle',
    foreign_label: '_id',
    editable: false,
  },
]

// export const pageConfig = {
// 	pages: {
// 		listing: {
// 			fieldsToDisplay:
// 		}
// 	}
// }
