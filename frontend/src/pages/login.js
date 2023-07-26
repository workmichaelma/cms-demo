import React, { useCallback, useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Box, Button, TextField, InputAdornment } from '@mui/material'
import { Person, Password } from '@mui/icons-material'
import { useLocation } from 'react-router-dom'

import { LOGIN } from 'utils/query'
import { redirect } from 'utils'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [ok, setOk] = useState(null)
  const location = useLocation()

  const [submit, submitMetadata] = useMutation(LOGIN)
  const login = useCallback(() => {
    if (username && password) {
      submit({
        variables: {
          data: {
            username,
            password,
          },
        },
      })
    }
  }, [username, password, submit])

  useEffect(() => {
    const { data, called } = submitMetadata || {}
    const { search } = location
    if (data && called) {
      if (data?.login) {
        const searchParams = new URLSearchParams(search || '')
        const redirectPath = searchParams.get('redirectPath')
        redirect({ url: redirectPath ? decodeURI(redirectPath) : '' })
      } else {
        setOk(false)
      }
    }
  }, [submitMetadata, location])

  return (
    <div className='w-screen h-screen flex items-center justify-center bg-zinc-300'>
      <div className='flex flex-col gap-6'>
        <div className='w-[440px] flex items-center justify-center'>
          <img
            src='/assets/images/logo--dark.png'
            alt='logo'
            className='w-[300px]'
          />
        </div>
        <Box>
          <div className='w-[440px] bg-white shadow-md p-6 flex flex-col gap-5'>
            <div className='text-center text-lg'>Login to WCCL - VMS</div>
            <div className=''>
              <TextField
                fullWidth
                type='text'
                size='small'
                placeholder='Username'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Person />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  setUsername(e.target.value)
                }}
              />
            </div>
            <div className=''>
              <TextField
                fullWidth
                type='password'
                size='small'
                placeholder='Password'
                onKeyUp={(e) => {
                  if (e.key === 'Enter' && username && password) {
                    login()
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Password />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
              />
            </div>
            {ok === false && (
              <div className='text-red-600 mt-[-8px]'>
                Wrong username or password. Please try again.
              </div>
            )}
            <div className='flex justify-end'>
              <Button
                variant='contained'
                onClick={login}
                disabled={password === '' || username === ''}
              >
                Sign In
              </Button>
            </div>
            <div className='flex flex-col gap-2 text-xs'>
              <p>
                This area is restricted to WCCL - VMS. <br />
                If you are not the owner of this site, please leave.
              </p>
              <p>
                Copyright © 2023 Welcome Construction Co., Ltd.. All rights
                reserved.{' '}
                <a
                  href='https://www.ysd.hk/'
                  target='_blank'
                  rel='noreferrer'
                  className='text-blue-500'
                >
                  Web Solution
                </a>{' '}
                by YSD
              </p>
            </div>
          </div>
        </Box>
      </div>
    </div>
  )
}

export default LoginPage
