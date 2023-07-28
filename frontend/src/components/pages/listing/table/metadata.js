import React from 'react'

import { IconButton } from '@mui/material'
import { NavigateBefore, NavigateNext } from '@mui/icons-material'
function TableMetadata({
  setPage,
  hasPrevPage,
  hasNextPage,
  page,
  pageSize,
  rowsLength,
  total,
}) {
  return (
    <div className='py-2 text-lg'>
      <div className='flex gap-2 items-center'>
        <div className=''>
          <IconButton
            onClick={() => setPage(page - 1)}
            disabled={!hasPrevPage}
          >
            <NavigateBefore />
          </IconButton>
        </div>
        <div className=''>
          {`${(page - 1) * pageSize + 1} - ${
            (page - 1) * pageSize + rowsLength
          } of ${total || 0}`}
        </div>
        <div className=''>
          <IconButton
            onClick={() => setPage(page + 1)}
            disabled={!hasNextPage}
          >
            <NavigateNext />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default TableMetadata
