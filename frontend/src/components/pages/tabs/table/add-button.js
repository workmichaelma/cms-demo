import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useState } from 'react'
import { redirect } from 'utils'
import Popup from 'components/pages/tabs/popup'

const AddButton = ({
  schema,
  collection,
  _id,
  targetId,
  keyName,
  showPopup,
  prefix,
  store,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {open && (
        <Popup
          isAdd
          open={open}
          toClose={() => setOpen(false)}
          schema={schema}
          collection={collection}
          store={store}
        />
      )}

      <Button
        variant='text'
        color='primary'
        onClick={() => {
          if (showPopup === false) {
            redirect({
              url: `/${prefix}/new?vehicle=${_id}`,
              toNew: true,
            })
          } else {
            setOpen(true)
          }
        }}
        endIcon={<Add />}
      >
        新增紀錄
      </Button>
    </div>
  )
}

export default AddButton
