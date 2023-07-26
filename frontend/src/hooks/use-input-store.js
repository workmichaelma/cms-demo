import { useAtom } from 'jotai'
import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isEmpty, isUndefined, reduce, isNull } from 'lodash'
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
      (result, value) => {
        if (!(isUndefined(value) || isNull(value))) {
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

  useEffect(() => {
    const { data, called, error, reset } = submitMetadata

    if (called && canSave) {
      setInputs({})
      setInputErrors({})
      if (error) {
        setAlert({ message: '發生錯誤', type: 'error' })
      } else {
        if (isEdit) {
          setAlert({ message: '成功更新!', type: 'success' })
          refetch().then(() => {
            reset()
          })
        }
      }
    }
  }, [isEdit, submitMetadata, refetch, setAlert, canSave])

  const save = useCallback(() => {
    if (canSave) {
      submit({
        variables: {
          collection,
          _id,
          body: {
            [collection]: body,
          },
        },
      })
    }
  }, [canSave, body, collection, submit, _id])

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
  }
}
