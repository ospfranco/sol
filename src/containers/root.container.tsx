import {observer} from 'mobx-react-lite'
import React from 'react'
import {View} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {SearchWidget} from 'widgets/search.widget'
import {WeatherWidget} from 'widgets/weather.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  if (!store.ui.visible) {
    return null
  }

  return (
    <View style={tw.style(`flex-1`)}>
      <SearchWidget />
      <View
        style={tw`flex-row border-t border-gray-200 dark:border-darkBorder`}>
        <CalendarWidget
          style={tw`border-r border-gray-200 dark:border-darkBorder flex-1`}
        />
        <WeatherWidget />
      </View>
    </View>
  )
})
