import React from 'react'
import {View} from 'react-native'
import {CalendarWidget} from 'widgets/calendar.widget'
import {WeatherWidget} from 'widgets/weather.widget'
import {TodosWidget} from 'widgets/todos.widget'
import tw from 'tailwind'
import {SearchWidget} from 'widgets/search.widget'
import {FavoritesWidget} from 'widgets/favorites.widget'
import {observer} from 'mobx-react-lite'
import {useStore} from 'store'

export const RootContainer = observer(() => {
  const store = useStore()

  return (
    <View style={{flex: 1}}>
      <SearchWidget />
      <View style={tw`flex-row pt-1`}>
        <TodosWidget style={tw`mr-1`} />

        <CalendarWidget style={tw`mr-1`} />

        <WeatherWidget />
      </View>
      <FavoritesWidget style={tw`mt-1`} />
    </View>
  )
})
