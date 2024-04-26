import {Key} from 'components/Key'
import {solNative} from 'lib/SolNative'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'

export let CalendarWidget: FC = observer(() => {
  let store = useStore()
  let focused = store.ui.focusedWidget === Widget.CALENDAR

  useEffect(() => {
    if (focused) {
      solNative.turnOnHorizontalArrowsListeners()
    } else {
      solNative.turnOffHorizontalArrowsListeners()
    }
  }, [focused])

  if (store.ui.calendarAuthorizationStatus === 'notDetermined') {
    return (
      <TouchableOpacity
        onPress={() => {
          solNative.requestCalendarAccess().then(() => {
            store.ui.getCalendarAccess()
          })
        }}>
        <View className="py-2 px-3">
          <Text className="text-sm">Click to grant calendar access</Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (!store.calendar.upcomingEvent) {
    return null
  }

  let lStart = DateTime.fromISO(store.calendar.upcomingEvent.date)
  let diff = Math.floor(lStart.diffNow().as('minutes'))

  return (
    <View className="px-2 py-2 flex-row items-center gap-1 border-t border-neutral-100 dark:border-neutral-700">
      <View
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: store.calendar.upcomingEvent.color,
        }}
      />
      <Text className="font-semibold text-sm">
        {store.calendar.upcomingEvent.title?.trim()}
      </Text>
      {diff > 0 ? (
        <Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            in{' '}
          </Text>
          <Text className="text-sm font-semibold">{diff}</Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {' '}
            minutes
          </Text>
        </Text>
      ) : (
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          has started
        </Text>
      )}
      <View className="flex-1" />
      <Key
        title={!!store.calendar.upcomingEvent.eventLink ? 'Join' : 'Open'}
        symbol="return"
        primary
      />
    </View>
  )
})
