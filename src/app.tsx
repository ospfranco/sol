import React, {useState} from 'react'
import {Image, ScrollView, Text, TextInput, View} from 'react-native'
import spotifyLogo from './assets/spotify.png'
import figma from './assets/figma.png'
import notion from './assets/notion.png'
import googleTranslate from './assets/google_translate.png'
import todo from './assets/todo.png'
import {CalendarWidget} from 'widgets/calendar.widget'
import {WeatherWidget} from 'widgets/weather.widget'
import {TodosWidget} from 'widgets/todos.widget'
import tw from 'tailwind'
import {SearchWidget} from 'widgets/search.widget'
import {FavoritesWidget} from 'widgets/favorites.widget'

export const App = () => {
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
}
