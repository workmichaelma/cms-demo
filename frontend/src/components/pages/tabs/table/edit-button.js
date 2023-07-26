import { Edit } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { redirect } from 'utils'

import Popup from 'components/pages/tabs/popup'
import { set } from 'lodash'

const EditButton = ({ row, schema, collection, showPopup, store }) => {
  const [open, setOpen] = useState(false)
  const { setInputs } = store

  useEffect(() => {
    setInputs((v) => {
      return set({ ...v }, 'relation', {
        ...v.relation,
        action: 'UPDATE',
        doc_id: row.doc_id,
      })
    })
  }, [setInputs, row])

  return (
    <div className='text-zinc-400 hover:text-zinc-900 w-6'>
      {open && (
        <Popup
          isEdit
          open={open}
          toClose={() => {
            setOpen(false)
          }}
          row={row}
          schema={schema}
          collection={collection}
          store={store}
        />
      )}

      <Edit
        onClick={() => {
          if (showPopup === false) {
            redirect({ url: `/${collection}/${row.target_id}`, toNew: true })
          } else {
            setOpen(true)
          }
        }}
      />
    </div>
  )
}

export default EditButton
