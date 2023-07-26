import { Fragment } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { createUploadLink } from 'apollo-upload-client'
import {
  gql,
  useQuery,
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
} from '@apollo/client'

import Document from '_document'
import LoginPage from 'pages/login'
// import LogPage from 'pages/log'
// import ValidLicensePage from 'pages/valid_license'
// import ValidInsurancePage from 'pages/valid_license'
// import EmptyRegMark from 'pages/empty_reg_mark'
// import DriverPermitPage from 'pages/driver_permit'
// import IndexPage from 'pages'

import { routes } from 'routes'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createUploadLink({
    uri: 'http://localhost/graphql',
    credentials: 'include',
    headers: {
      'Apollo-Require-Preflight': 'true',
    },
  }),
})

function App() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  return (
    <div>
      <ApolloProvider client={client}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {isLogin ? (
            <Routes>
              <Route
                path='/login'
                element={<LoginPage />}
              />
            </Routes>
          ) : (
            <Document>
              <Routes>
                {routes.map((r) => {
                  const { Element, prefix, title, collection } = r
                  return (
                    <Fragment key={prefix}>
                      <Route
                        path={`/${prefix}`}
                        element={
                          <Element
                            mode='home'
                            {...r}
                          />
                        }
                      />
                      <Route
                        path={`/${prefix}/new`}
                        element={
                          <Element
                            mode='new'
                            {...r}
                          />
                        }
                      />
                      <Route
                        path={`/${prefix}/copy/:_id`}
                        element={
                          <Element
                            mode='copy'
                            {...r}
                          />
                        }
                      />
                      <Route
                        path={`/${prefix}/:_id`}
                        element={
                          <Element
                            mode='edit'
                            {...r}
                          />
                        }
                      />
                      <Route
                        path={`/${prefix}/:_id/:tab`}
                        element={
                          <Element
                            mode='edit'
                            {...r}
                          />
                        }
                      />
                      <Route
                        path={`/${prefix}/import`}
                        element={
                          <Element
                            mode='import'
                            {...r}
                          />
                        }
                      />
                    </Fragment>
                  )
                })}
              </Routes>
            </Document>
          )}
        </LocalizationProvider>
      </ApolloProvider>
    </div>
  )
}

export default App
