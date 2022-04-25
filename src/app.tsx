import { RootContainer } from 'containers'
import 'intl'
import 'intl/locale-data/jsonp/en'
import { configure } from 'mobx'
import React from 'react'
import { LogBox } from 'react-native'
import { root, StoreProvider } from 'store'

configure({
  useProxies: 'never',
})

LogBox.ignoreLogs(['AsyncStorage ', 'Clipboard ', 'Component'])

export const App = () => {
  return (
    <StoreProvider value={root}>
      <RootContainer />
    </StoreProvider>
  )
}
