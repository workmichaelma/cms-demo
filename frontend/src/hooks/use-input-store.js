import { useAtom } from 'jotai'
import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isEmpty, isUndefined, reduce, isNull, isFunction, set } from 'lodash'
import { ENTITY_UPDATE, ENTITY_INSERT } from 'utils/query'
import { alert, topBar } from 'global-store'

export const useInputStore = ({
  _id,
  collection,
  isEdit,
  isNew,
  isCopy,
  refetch,
}) => {
  const [inputs, setInputs] = useState({})
  const [inputErrors, setInputErrors] = useState({})
  const [_, setTopBar] = useAtom(topBar)
  const [__, setAlert] = useAtom(alert)

  const [submit, submitMetadata] = useMutation(
    isEdit ? ENTITY_UPDATE : ENTITY_INSERT
  )

  const hasError = useMemo(() => {
    return reduce(
      inputErrors,
      (result, value, key) => {
        if (key === 'relation') {
        } else if (!(isUndefined(value) || isNull(value))) {
          result = true
        }
        return result
      },
      false
    )
  }, [inputErrors])

  const body = useMemo(() => {
    return reduce(
      inputs,
      (result, value, key) => {
        if (!isUndefined(value)) {
          result[key] = value
        }
        return result
      },
      {}
    )
  }, [inputs])

  const canSave = useMemo(() => {
    return !hasError && !isEmpty(body)
  }, [hasError, body])

  const save = useCallback(() => {
    console.log(body, canSave, inputErrors, 'save')

    if (canSave) {
      console.log(body, 'SAVE button clicked')
      submit({
        variables: {
          collection,
          _id,
          body: {
            [collection]: body,
          },
        },
      }).then((data) => {
        const { called, error, reset } = submitMetadata
        setInputs({})
        setInputErrors({})
        if (isEdit) {
          if (data?.data?.updateEntity) {
            setAlert({ message: '成功更新!', type: 'success' })
            if (isFunction(refetch)) {
              refetch().then(() => {
                console.log('REFETCHED')
                reset()
              })
            }
          } else {
            setAlert({ message: '發生錯誤', type: 'error' })
          }
        }
      })
    }
  }, [canSave, body, collection, submit, _id, setAlert, isEdit])

  useEffect(() => {
    setTopBar((v) => ({
      ...v,
      canSave,
      save,
    }))
  }, [canSave, setTopBar, save])

  return {
    setInputs,
    setInputErrors,
    save,
  }
}
