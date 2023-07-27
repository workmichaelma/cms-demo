export const schema = [
  {
    title: '簡稱',
    type: 'text',
    placeholder: 'short_name： e.g. 偉金 / WCCL',
    field: 'short_name',
  },
  {
    title: '公司英文名稱',
    type: 'text',
    placeholder: 'name： Company name in English',
    field: 'name',
  },
  {
    title: '公司名稱',
    type: 'text',
    placeholder: 'name_tc： Company name in Chinese',
    field: 'name_tc',
    unique_key: true,
    is_required: true,
  },
  {
    title: '註冊號碼',
    type: 'text',
    placeholder: 'reg_number： eg. CI No.',
    field: 'reg_number',
  },
  {
    title: '電話號碼',
    type: 'text',
    placeholder: 'contact_number: for Apply 駕駛許可 form to use',
    is_phone: true,
    field: 'contact_number',
  },
  {
    title: '地址',
    type: 'text',
    placeholder: 'address: for Apply 駕駛許可 form to use',
    is_multiple: false,
    field: 'address',
  },
  {
    title: '電郵',
    type: 'text',
    placeholder: 'email: ',
    is_multiple: true,
    extendable: true,
    is_email: true,
    field: 'email',
  },
  {
    title: '備註',
    type: 'textarea',
    placeholder: 'remarks: ',
    field: 'remarks',
  },
  {
    title: '簽名',
    type: 'relation',
    foreign: 'file',
    foreign_label: '_id',
    placeholder: 'sign_image: ',
    default: null,
    field: 'sign_image',
  },
  {
    title: '公司印',
    type: 'relation',
    foreign: 'file',
    foreign_label: '_id',
    placeholder: 'chop_image: ',
    default: null,
    field: 'chop_image',
  },
  {
    title: '公司 Logo',
    type: 'relation',
    foreign: 'file',
    foreign_label: '_id',
    placeholder: 'logo_image: ',
    default: null,
    field: 'logo_image',
  },
]

export const pageConfig = {
  pages: [
    {
      page: 'listing',
      fieldsToDisplay: ['short_name', 'name_tc', 'reg_number', 'status'],
    },
  ],
}
