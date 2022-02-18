import React from 'react'
import {View} from 'react-native'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {SearchWidget} from 'widgets/search.widget'
import {WeatherWidget} from 'widgets/weather.widget'

export const RootContainer = () => {
  useDeviceContext(tw)
  return (
    <View
      style={tw.style(
        `flex-1 rounded-lg border bg-light dark:bg-dark shadow-xl border-gray-200 dark:border-darkBorder`,
      )}>
      <SearchWidget />
      <View
        style={tw`flex-row border-t border-gray-200 dark:border-darkBorder`}>
        <CalendarWidget
          style={tw`border-r border-gray-200 dark:border-darkBorder`}
        />
        <WeatherWidget />
      </View>
    </View>
  )
}
