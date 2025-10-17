import './global.css'
import 'config'
import { RootContainer } from 'containers'
import 'intl'
import 'intl/locale-data/jsonp/en'
import { root, StoreProvider } from 'store'
import { remapProps, vars } from 'nativewind'
import { accentRgb } from 'mytailwind'
import { LogBox, View } from 'react-native'
import { LegendList } from '@legendapp/list'

const userTheme = vars({
  '--color-accent': `${accentRgb?.r}, ${accentRgb?.g}, ${accentRgb?.b}`,
})

LogBox.ignoreLogs(['Sending ', '[legend-list]'])

// @ts-ignore
remapProps(LegendList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
})

export const App = () => {
  return (
    <StoreProvider value={root}>
      <View style={userTheme}>
        <RootContainer />
      </View>
    </StoreProvider>
  )
}
