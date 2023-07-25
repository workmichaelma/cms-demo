import { TextField, FormControl, Select, MenuItem } from '@mui/material'
import { ArrowDownward, ArrowUpward, Done, Clear } from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers'

function Header({
  cols,
  sortField,
  setSortField,
  setSort,
  setFilterFields,
  fliterFields,
}) {
  return cols.map((col) => {
    return (
      <div
        className='grow basis-0 flex flex-col'
        key={col.field}
      >
        <div
          className='text-md font-bold text-left hover:cursor-pointer select-none'
          onClick={() => {
            const { order } = sortField
            setSortField({
              field: col.field,
              order: order === 'asc' ? 'desc' : 'asc',
            })
            setSort(`sort=${order === 'asc' ? '' : '-'}${col.field}`)
          }}
        >
          <span>{col.headerName}</span>
          {sortField.field === col.field && (
            <span>
              {sortField.order === 'asc' ? (
                <ArrowDownward
                  color='disabled'
                  fontSize='small'
                />
              ) : (
                <ArrowUpward
                  color='disabled'
                  fontSize='small'
                />
              )}
            </span>
          )}
        </div>
        <div className='grow py-2'>
          {col.type === 'date' ? (
            <DatePicker
              clearable
              slotProps={{
                actionBar: { actions: ['clear', 'today'] },
              }}
              format='YYYY-MM-DD'
              onChange={(date) => {
                setFilterFields((v) => {
                  return {
                    ...v,
                    [col.field]:
                      date && date.isValid() ? date.toISOString() : undefined,
                  }
                })
              }}
              sx={{
                '.MuiOutlinedInput-input': {
                  padding: 0,
                  paddingLeft: 1,
                  height: 40,
                },
              }}
            />
          ) : col.field === 'status' ? (
            <FormControl fullWidth>
              <Select
                fullWidth
                value={fliterFields.status || ''}
                onChange={(e) => {
                  setFilterFields((v) => {
                    return {
                      ...v,
                      status: e.target.value,
                    }
                  })
                }}
                sx={{
                  height: '40px',
                }}
              >
                <MenuItem value={undefined}>
                  <Done color='success' /> | <Clear color='warning' />
                </MenuItem>
                <MenuItem value={true}>
                  <Done color='success' />
                </MenuItem>
                <MenuItem value={false}>
                  <Clear color='warning' />
                </MenuItem>
              </Select>
            </FormControl>
          ) : (
            <TextField
              size='small'
              fullWidth
              onChange={(e) => {
                setFilterFields((v) => {
                  return {
                    ...v,
                    [col.field]: e.target.value,
                  }
                })
              }}
            />
          )}
        </div>
      </div>
    )
  })
}

export default Header
