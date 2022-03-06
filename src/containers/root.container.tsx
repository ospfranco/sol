import {observer} from 'mobx-react-lite'
import React from 'react'
import {View} from 'react-native'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {GeneralWidget} from 'widgets/general.widget'
import {SearchWidget} from 'widgets/search.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)

  return (
    <View style={tw`flex-1`}>
      <SearchWidget
        style={tw`bg-gray-100 dark:bg-black bg-opacity-70 dark:bg-opacity-50`}
      />

      <CalendarWidget
        style={tw`border-t w-full bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-60 border-lightBorder dark:border-darkBorder`}
      />
      <GeneralWidget
        style={tw`border-t w-full bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-70 border-lightBorder dark:border-darkBorder`}
      />
    </View>
  )
})
