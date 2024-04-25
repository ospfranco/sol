import './global.css'
import 'config'
import {RootContainer} from 'containers'
import 'intl'
import 'intl/locale-data/jsonp/en'
import React from 'react'
import {root, StoreProvider} from 'store'

export const App = () => {
  return (
    <StoreProvider value={root}>
      <RootContainer />
    </StoreProvider>
  )
}
