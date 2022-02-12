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
    <View
      style={tw`flex-1 border border-gray-200 rounded-lg bg-light dark:bg-dark dark:border-gray-800`}>
      <SearchWidget />
      <View style={tw`flex-row border-t dark:border-gray-800`}>
        {/* <TodosWidget style={tw`mr-1`} /> */}

        <CalendarWidget />

        <WeatherWidget />
      </View>
      {/* <FavoritesWidget style={tw`mt-1`} /> */}
    </View>
  )
})
