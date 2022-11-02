import * as Sentry from '@sentry/react-native'
import 'config'
import {RootContainer} from 'containers'
import 'intl'
import 'intl/locale-data/jsonp/en'
import React, {useEffect} from 'react'
import {root, StoreProvider} from 'store'

// configure({
//   useProxies: 'never',
// })

if (!__DEV__) {
  Sentry.init({
    dsn: 'https://51f61feb4c66446e88e4211a6aebf0b7@o386747.ingest.sentry.io/6377873',
  })
}

export const App = () => {
  return (
    <StoreProvider value={root}>
      <RootContainer />
    </StoreProvider>
  )
}
