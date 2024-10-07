import './global.css'
import 'config'
import {RootContainer} from 'containers'
import 'intl'
import 'intl/locale-data/jsonp/en'
import React from 'react'
import {root, StoreProvider} from 'store'
import {vars} from 'nativewind'
import {accentRgb} from 'tailwind'
import {LogBox, View} from 'react-native'

const userTheme = vars({
  '--color-accent': `${accentRgb?.r}, ${accentRgb?.g}, ${accentRgb?.b}`,
})

LogBox.ignoreLogs(['Sending '])

export const App = () => {
  return (
    <StoreProvider value={root}>
      <View style={userTheme}>
        <RootContainer />
      </View>
    </StoreProvider>
  )
}
