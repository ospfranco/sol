import './global.css'
import 'config'
import {RootContainer} from 'containers'
import 'intl'
import 'intl/locale-data/jsonp/en'
import {remapProps} from 'nativewind'
import React from 'react'
import {root, StoreProvider} from 'store'
import {FlatList, ScrollView} from 'react-native'

export const App = () => {
  return (
    <StoreProvider value={root}>
      <RootContainer />
    </StoreProvider>
  )
}
