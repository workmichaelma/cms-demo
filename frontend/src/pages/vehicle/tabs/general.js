import General from 'components/pages/general'
import { useEffect, useState } from 'react'

export default function GeneralPage({
  data,
  collection,
  isEdit,
  isCopy,
  isNew,
}) {
  const [inputs, setInputs] = useState({})
  const [inputErrors, setInputErrors] = useState({})
  useEffect(() => {
    console.log({ inputs, inputErrors })
  }, [inputs, inputErrors])
  return (
    <div className=''>
      <General
        data={data}
        setInputs={setInputs}
        setInputErrors={setInputErrors}
        collection={collection}
      />
    </div>
  )
}
