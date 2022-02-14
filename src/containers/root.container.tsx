import {solNative} from 'lib/SolNative'
import React from 'react'
import {Pressable, View} from 'react-native'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {SearchWidget} from 'widgets/search.widget'
import {WeatherWidget} from 'widgets/weather.widget'

export const RootContainer = () => {
  useDeviceContext(tw)
  return (
    <Pressable
      onPress={e => {
        if (!e.isDefaultPrevented()) {
          solNative.hideWindow()
        }
      }}
      style={tw`items-center pt-[8%] flex-1 bg-gray-900 bg-opacity-35`}>
      <Pressable
        onPress={e => {
          e.preventDefault()
          e.stopPropagation()
        }}>
        <View
          style={tw.style(`rounded-lg bg-light dark:bg-dark shadow-xl`, {
            width: 800,
            height: 600,
          })}>
          <SearchWidget />
          <View
            style={tw`flex-row border-t border-gray-200 dark:border-gray-800`}>
            <CalendarWidget style={tw`border-r dark:border-gray-800`} />
            <WeatherWidget />
          </View>
        </View>
      </Pressable>
    </Pressable>
  )
}
