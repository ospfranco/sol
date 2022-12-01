import {solNative} from 'lib/SolNative'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect} from 'react'
import {ScrollView, Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const CalendarWidget: FC<Props> = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  const focused = store.ui.focusedWidget === Widget.CALENDAR
  const events = store.ui.groupedEvents
  const groupedEvents = Object.entries(events)

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
          <Text style={tw`text-xs`}>Click to grant calendar access</Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (!groupedEvents.length) {
    return null
  }

  if (groupedEvents.every(day => day[1].events.length === 0)) {
    return (
      <View className="px-3 py-2 bg-neutral-100 dark:bg-black bg-opacity-50">
        <Text className="text-xs text-neutral-400 dark:text-neutral-600">
          No upcoming events
        </Text>
      </View>
    )
  }

  return (
    <View
      style={tw`px-2 py-2 flex-row bg-neutral-100 dark:bg-black bg-opacity-50`}>
      {groupedEvents.map(([key, data], i) => {
        return (
          <View key={key} style={tw`flex-row flex-1`}>
            <View style={tw`flex-1`}>
              <View className="flex-row">
                {key === 'today' || key === 'tomorrow' ? (
                  <Text className="capitalize text-neutral-400 dark:text-neutral-600 text-xxs ml-1">
                    {key}
                  </Text>
                ) : (
                  <Text className="capitalize text-neutral-400 dark:text-neutral-600 text-xxs ml-1">
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
                  const storeIndex = store.ui.filteredEvents.findIndex(
                    e => e.id === event.id && e.date === event.date,
                  )
                  const highlighted =
                    focused && store.ui.selectedIndex === storeIndex
                  const isNow =
                    !!store.ui.upcomingEvent &&
                    store.ui.upcomingEvent.id === event.id

                  return (
                    <View
                      key={index}
                      style={tw.style(
                        `flex-row items-center py-1 px-1 border border-transparent rounded`,
                        {
                          'bg-gray-200 dark:bg-proGray-900 border-neutral-300 dark:border-neutral-600':
                            highlighted,
                          'p-0.5': event.isAllDay,
                        },
                      )}>
                      {/* <View
                        className="h-1.5 w-1.5 rounded-full"
                        style={tw.style({
                          backgroundColor: event.color,
                        })}
                      /> */}
                      {!event.isAllDay && (
                        <Text
                          className="text-xs"
                          style={{color: `${event.color}BB`}}>
                          {lDate.toFormat('HH:mm')}
                        </Text>
                      )}
                      <Text
                        numberOfLines={1}
                        style={tw.style(`text-xs ml-1`, {
                          'line-through': event.declined,
                          'font-bold': isNow,
                        })}>
                        {event.title}
                      </Text>
                    </View>
                  )
                })}
                {/* {data.notShown > 0 && (
                  <Text style={tw`text-neutral-600 text-xs ml-2`}>
                    + {data.notShown} more...
                  </Text>
                )} */}
              </ScrollView>
            </View>

            {/* <View
              style={tw`h-4 border-r dark:border-darkBorder border-lightBorder`}
            /> */}
          </View>
        )
      })}
    </View>
  )
})
