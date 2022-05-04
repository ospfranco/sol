import {RootContainer} from 'containers'
import 'intl'
import 'intl/locale-data/jsonp/en'
import {configure} from 'mobx'
import React from 'react'
import {LogBox} from 'react-native'
import {root, StoreProvider} from 'store'
import * as Sentry from '@sentry/react-native'

configure({
  useProxies: 'never',
})

LogBox.ignoreLogs(['AsyncStorage ', 'Clipboard ', 'Component'])

Sentry.init({
  dsn: 'https://51f61feb4c66446e88e4211a6aebf0b7@o386747.ingest.sentry.io/6377873',
})

export const App = () => {
  return (
    <StoreProvider value={root}>
      <RootContainer />
    </StoreProvider>
  )
}
