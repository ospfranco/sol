import React from 'react'
import {View} from 'react-native'
import {CalendarWidget} from 'widgets/calendar.widget'
import {WeatherWidget} from 'widgets/weather.widget'
import {TodosWidget} from 'widgets/todos.widget'
import tw from 'tailwind'
import {SearchWidget} from 'widgets/search.widget'
// import {FavoritesWidget} from 'widgets/favorites.widget'
import {observer} from 'mobx-react-lite'
import {useStore} from 'store'

export const RootContainer = observer(() => {
  return (
    <View
      style={tw`flex-1 border border-gray-200 rounded-lg bg-light dark:bg-dark dark:border-gray-800`}>
      <SearchWidget />
      <View style={tw`flex-row`}>
        {/* <TodosWidget style={tw`mr-1`} /> */}

        <CalendarWidget />

        <WeatherWidget />
      </View>
      {/* <FavoritesWidget style={tw`mt-1`} /> */}
    </View>
  )
})
