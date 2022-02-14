import {observer} from 'mobx-react-lite'
import React from 'react'
import {View} from 'react-native'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {SearchWidget} from 'widgets/search.widget'
import {WeatherWidget} from 'widgets/weather.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)
  return (
    <View style={tw`items-center pt-[8%] flex-1 bg-black bg-opacity-35`}>
      <View
        style={tw.style(
          `border border-gray-200 rounded-lg bg-light dark:bg-dark dark:border-gray-800`,
          {
            width: 800,
            height: 600,
          },
        )}>
        <SearchWidget />
        <View
          style={tw`flex-row border-t border-gray-200 dark:border-highlightDark`}>
          <CalendarWidget />
          <WeatherWidget />
        </View>
      </View>
    </View>
  )
})
