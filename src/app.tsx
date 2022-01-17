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

export const App = () => {
  return (
    <View style={{flex: 1}}>
      <SearchWidget />
      <View style={tw`flex-row`}>
        <TodosWidget style={tw`mr-1`} />

        <CalendarWidget style={tw`mr-1`} />

        <WeatherWidget />
      </View>
      <View
        style={{
          backgroundColor: 'rgba(39, 40, 43, 0.98)',
          padding: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#444',
          width: '100%',
          marginTop: 10,
        }}>
        <Text style={{fontSize: 12, fontWeight: '500', color: '#AAA'}}>
          Favorites
        </Text>
        <View style={{flexDirection: 'row', paddingVertical: 10}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={spotifyLogo} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              Spotify
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={notion} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              Notion
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={todo} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              MS Todo
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={figma} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              Figma
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={googleTranslate} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              Translate
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
