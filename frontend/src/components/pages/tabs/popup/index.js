import { Clear, Done } from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'

import Content from './content'

export default function FormDialog({
  _id,
  open,
  toClose,
  isAdd,
  isEdit,
  isDelete,
  row,
  schema,
  collection,
  collectionId,
  targetId,
  keyName,
  refetch,
  store,
}) {
  return (
    <Dialog
      open={open}
      onClose={(e, r) => {
        if (r === 'backdropClick') {
          return
        }
        toClose()
      }}
      sx={{
        '.MuiDialog-paper': {
          borderRadius: '12px',
          maxWidth: '50vw',
          minWidth: '600px',
        },
        '.MuiDialogTitle-root': {
          borderBottom: '1px solid #e8e8e8',
        },
        '.MuiDialogContent-root': {
          padding: '0',
        },
      }}
    >
      <DialogTitle>
        <div className='flex w-full justify-between'>
          <div>
            {isEdit ? '更新' : isDelete ? '刪除' : isAdd ? '新增' : ''}紀錄
          </div>
          <div className='text-zinc-400 cursor-pointer'>
            <Clear onClick={toClose} />
          </div>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className='min-w-[50vw]'>
          <Content
            schema={schema}
            row={row}
            isDelete={isDelete}
            isEdit={isEdit}
            isAdd={isAdd}
            store={store}
          />
        </div>
        {/* <DialogContentText>紀錄刪除後，將無法復原</DialogContentText> */}
      </DialogContent>
      <DialogActions>
        <div className='flex w-full justify-center'>
          <Button
            onClick={() => {
              store.save()
              toClose()
            }}
            color='primary'
            endIcon={<Done />}
          >
            確定{isEdit ? '修改' : isDelete ? '刪除' : ''}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  )
}
