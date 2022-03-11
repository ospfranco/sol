import {RootContainer} from 'containers'
import React from 'react'
import {root, StoreProvider} from 'store'
import {configure} from 'mobx'
import {LogBox} from 'react-native'
import 'intl'
import 'intl/locale-data/jsonp/en'

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
