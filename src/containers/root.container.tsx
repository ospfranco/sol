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
    <View style={tw.style(`flex-1 rounded-lg bg-light dark:bg-dark shadow-xl`)}>
      <SearchWidget />
      <View style={tw`flex-row border-t border-gray-200 dark:border-gray-800`}>
        <CalendarWidget style={tw`border-r dark:border-gray-800`} />
        <WeatherWidget />
      </View>
    </View>
  )
}
