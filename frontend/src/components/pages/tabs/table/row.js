import React from 'react'
import {
  Box,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
} from '@mui/material'
import { map } from 'lodash'
import EditButton from './edit-button'
import DeleteButton from './delete-button'
import To from 'components/common/to'
import { ContentCopy } from '@mui/icons-material'

function Row({
  editable,
  deletable,
  copyable,
  collection,
  schema,
  row,
  _id,
  showPopup,
  store,
}) {
  return (
    <TableRow
      hover
      role='checkbox'
      tabIndex={-1}
      key={row.name}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell padding='checkbox'>
        <div className='flex gap-1'>
          {/* <To
                url={`/${targetId ? collection : keyName}/${
                  row._id
                }`}
                toNew
              >
                <div className='text-zinc-400 hover:text-zinc-900'>
                  <Search />
                </div>
              </To> */}
          {editable === true && (
            <EditButton
              row={row}
              schema={schema}
              collection={collection}
              showPopup={showPopup}
              store={store}
            />
          )}
          {/* {deletable === true && (
            <DeleteButton
              data={row}
              schema={schema}
              collection={collection}
              collectionId={collectionId}
              targetId={targetId}
              keyName={keyName}
              popup={popup}
            />
          )} */}
        </div>
      </TableCell>
      {map(schema, (item) => {
        return <TableCell key={item.field}>{row[item.field]}</TableCell>
      })}

      <TableCell>
        {copyable && (
          <To
            url={`/${collection}/copy/${row._id}`}
            toNew
          >
            <div className='text-zinc-400 hover:text-zinc-900'>
              <ContentCopy />
            </div>
          </To>
        )}
      </TableCell>
    </TableRow>
  )
}

export default Row
