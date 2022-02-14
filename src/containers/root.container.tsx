import {Fade} from 'components/Fade'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React from 'react'
import {Pressable, View} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {SearchWidget} from 'widgets/search.widget'
import {WeatherWidget} from 'widgets/weather.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  return (
    <View
      // onPress={() => solNative.hideWindow()}
      style={tw`items-center pt-[8%] flex-1 bg-black bg-opacity-35`}>
      <Fade visible={store.ui.visible}>
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
            <CalendarWidget style={tw`border-r`} />
            <WeatherWidget />
          </View>
        </View>
      </Fade>
    </View>
  )
})
