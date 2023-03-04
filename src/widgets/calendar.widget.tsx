import {Key} from 'components/Key'
import {solNative} from 'lib/SolNative'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect} from 'react'
import {Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'

interface Props {
  style?: ViewStyle
}

export const CalendarWidget: FC<Props> = observer(() => {
  const store = useStore()
  const focused = store.ui.focusedWidget === Widget.CALENDAR
  const events = store.calendar.groupedEvents

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
          <Text className="text-xs">Click to grant calendar access</Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (!store.calendar.upcomingEvent) {
    return null
  }

  const lStart = DateTime.fromISO(store.calendar.upcomingEvent.date)

  return (
    <View className="px-4 py-2 flex-row items-center">
      {/* {groupedEvents.map(([key, data]) => {
        return (
          <View key={key} className="flex-row flex-1">
            <View className="flex-1">
              <View className="flex-row">
                {key === 'today' || key === 'tomorrow' ? (
                  <Text className="capitalize text-neutral-500 text-xs ml-1">
                    {key}
                  </Text>
                ) : (
                  <Text className="capitalize text-neutral-500 text-xs ml-1">
                    {data.date.toFormat('cccc')}
                  </Text>
                )}
              </View>
              <ScrollView
                className="max-h-49 mt-1"
                showsVerticalScrollIndicator={false}>
                {data.events.map((event, index) => {
                  const lDate = DateTime.fromISO(event.date)
                  // const lEndDate = event.endDate
                  //   ? DateTime.fromISO(event.endDate)
                  //   : null
                  const storeIndex = store.calendar.filteredEvents.findIndex(
                    e => e.id === event.id && e.date === event.date,
                  )
                  const highlighted =
                    focused && store.ui.selectedIndex === storeIndex
                  const isNow =
                    !!store.calendar.upcomingEvent &&
                    store.calendar.upcomingEvent.id === event.id

                  return (
                    <View
                      key={index}
                      className={clsx(
                        `flex-row items-center py-1 px-1 rounded-r border-l-2 border-transparent`,
                        {
                          'bg-lightHighlight dark:bg-darkHighlight border-neutral-600 dark:border-white':
                            highlighted,
                          'p-0.5': event.isAllDay,
                        },
                      )}>
                      {!event.isAllDay && (
                        <View
                          className="rounded-sm w-10"
                          style={{
                            backgroundColor: `${event.color}CC`,
                          }}>
                          <Text className="text-xs text-white text-center">
                            {lDate.toFormat('HH:mm')}
                          </Text>
                        </View>
                      )}
                      <Text
                        numberOfLines={1}
                        className={clsx('text-xs flex-shrink ml-1', {
                          'line-through': event.declined,
                          'font-bold': isNow && !event.isAllDay,
                        })}>
                        {event.title}
                      </Text>
                    </View>
                  )
                })}
              </ScrollView>
            </View>
          </View>
        )
      })} */}
      <View
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: `${store.calendar.upcomingEvent.color}CC`,
        }}
      />
      <Text className="ml-2 font-semibold text-sm">
        {store.calendar.upcomingEvent.title}
      </Text>
      <Text className="ml-1 text-sm">{lStart.toRelative()}</Text>
      <View className="flex-1" />
      <Text className="text-sm font-semibold">Join</Text>
      <Key title="Enter" className="ml-1" />
    </View>
  )
})
