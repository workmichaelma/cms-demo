const { Delete } = require('@mui/icons-material')
const { useState } = require('react')

const DeleteButton = ({
  data,
  schema,
  collection,
  collectionId,
  targetId,
  keyName,
}) => {
  const [open, setOpen] = useState(false)
  return (
    <div className='text-zinc-400 hover:text-zinc-900 w-6'>
      {/* {open && (
        <Popup
          isDelete
          open={open}
          toClose={() => setOpen(false)}
          data={data}
          schema={schema}
          collection={collection}
          collectionId={collectionId}
          targetId={targetId}
          keyName={keyName}
        />
      )} */}

      <Delete
        onClick={() => {
          setOpen(true)
        }}
      />
    </div>
  )
}

export default DeleteButton
