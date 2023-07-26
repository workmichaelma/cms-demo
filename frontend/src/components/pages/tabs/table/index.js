import React, { useState } from 'react'
import { alpha, styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { isEmpty, toNumber } from 'lodash'
import Header from './header'
import Row from './row'

import AddButton from './add-button'
import withRowsEmpty from 'hooks/with-rows-empty'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    // backgroundColor: theme.palette.common.black,
    padding: 4,
  },
  [`&.${tableCellClasses.body}`]: {
    padding: 4,
  },
}))

const isNumber = (v) => {
  return typeof value === 'number' || !isNaN(Number(v))
}

function descendingComparator(a, b, orderBy) {
  let _a = a[orderBy]
  let _b = b[orderBy]
  if (isNumber(_a) && isNumber(_b)) {
    _a = toNumber(_a)
    _b = toNumber(_b)
  }
  if (_b < _a) {
    return -1
  }
  if (_b > _a) {
    return 1
  }
  return 0
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

const TabTable = ({
  rows,
  setting,
  schema,
  collectionId,
  targetId,
  _id,
  store,
}) => {
  const {
    collection,
    prefix,
    keyName,
    popup,
    editable = true,
    deletable = true,
    addable = true,
    copyable = false,
    showPopup,
  } = setting
  const [order, setOrder] = useState('desc')
  const [orderBy, setOrderBy] = useState(setting.orderBy)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const visibleRows = React.useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [rows, order, orderBy, page, rowsPerPage]
  )

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

  return (
    <Box sx={{ width: '100%' }}>
      <div className='flex flex-col'>
        <div className='flex mt-4 ml-4'>
          {addable && (
            <AddButton
              collection={collection}
              prefix={prefix}
              _id={_id}
              targetId={targetId}
              schema={schema}
              showPopup={showPopup}
              store={store}
            />
          )}
        </div>
        <Paper sx={{ width: '100%', borderRadius: 0, overflowX: 'auto' }}>
          <div className='w-max min-w-full'>
            <TableContainer>
              <Table
                stickyHeader
                sx={{ minWidth: 750 }}
                aria-labelledby='tableTitle'
              >
                <Header
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                  schema={schema}
                />
                <TableBody>
                  {visibleRows.map((row, index) => {
                    console.log({ row })
                    return (
                      <Row
                        key={index}
                        collection={collection}
                        schema={schema}
                        editable={editable}
                        row={row}
                        store={store}
                      />
                    )
                  })}
                  {emptyRows > 0 && (
                    <TableRow
                      style={{
                        height: 53 * emptyRows,
                      }}
                    >
                      <StyledTableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Paper>
        <div className='bg-white'>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component='div'
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>
    </Box>
  )
}

export default withRowsEmpty(TabTable)
