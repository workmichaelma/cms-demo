import { useMemo, useState } from 'react'
import { endsWith, find, get, isBoolean, isEmpty } from 'lodash'

import {
  IconButton,
  TextField,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import {
  NavigateBefore,
  NavigateNext,
  ArrowDownward,
  ArrowUpward,
  Done,
  Clear,
} from '@mui/icons-material'
import To from 'components/common/to'
import dayjs from 'dayjs'
import { isISODateString } from 'utils/input'
import TableMetadata from './metadata'
import Header from './header'
import Row from './row'

const fieldsToDisplay = [
  'in_charge',
  'chassis_number',
  'print_number',
  'type',
  'purpose',
  'make',
  'vehicle_class',
  'license',
  'color',
  'manufacture_year',
  'reg_mark',
  'status',
]

function Table({
  prefix,
  data,
  loading,
  headerNames = {},
  setFilter,
  setSort,
}) {
  const [sortField, setSortField] = useState({ order: 'ASC' })
  const [fliterFields, setFilterFields] = useState([])
  const rows = data?.listing?.data || []
  const { hasNextPage, hasPrevPage, page, pageSize, total } =
    data?.listing?.metadata || {}
  const schema = data?.page?.schema || []

  const cols = useMemo(() => {
    return fieldsToDisplay.map((field) => {
      const _schema = find(schema, { field })
      return {
        field,
        headerName: headerNames[field] || _schema?.title,
        type: endsWith(field, '_date') ? 'date' : _schema?.type,
      }
    })
  }, [fieldsToDisplay, headerNames, schema])

  if (loading) {
    return (
      <div className='h-40 flex items-center justify-center w-full text-xl'>
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className='w-full overflow-x-auto text-md'>
      {!isEmpty(rows) && !loading && (
        <TableMetadata
          setFilter={setFilter}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          page={page}
          pageSize={pageSize}
          rowsLength={rows.length}
          total={total}
        />
      )}

      <div className=''>
        <div className='border rounded-tr-xl rounded-tl-xl bg-zinc-50 flex gap-4 p-2 border-b-0'>
          <Header
            cols={cols}
            sortField={sortField}
            fliterFields={fliterFields}
            setSort={setSort}
            setFilterFields={setFilterFields}
          />
        </div>
        <div className='bg-white border rounded-bl-xl rounded-br-xl py-3'>
          {isEmpty(rows) ? (
            <div className='h-40 flex items-center justify-center w-full text-xl'>
              無紀錄
            </div>
          ) : (
            rows.map((record) => (
              <Row
                key={record._id}
                prefix={prefix}
                record={record}
                cols={cols}
                schema={schema}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Table
