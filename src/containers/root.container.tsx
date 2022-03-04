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
  // const store = useStore()
  // let content = null
  // if (store.ui.visible) {
  //   content = (
  //     <>

  //     </>
  //   )
  // }

  return (
    <View
      style={tw.style(
        `flex-1 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-50`,
      )}>
      <SearchWidget />
      <CalendarWidget
        style={tw`border-t w-full border-lightBorder dark:border-darkBorder`}
      />
    </View>
  )
})
