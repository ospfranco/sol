import {observer} from 'mobx-react-lite'
import React from 'react'
import {View} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {SearchWidget} from 'widgets/search.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  if (!store.ui.visible) {
    return null
  }

  return (
    <View style={tw.style(`flex-1`)}>
      <SearchWidget />
      <CalendarWidget
        style={tw`border-t w-full border-gray-200 dark:border-gray-800`}
      />
    </View>
  )
})
