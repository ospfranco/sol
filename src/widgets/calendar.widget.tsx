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
      <View style={tw`p-2 mx-1`}>
        <TouchableOpacity
          onPress={() => {
            solNative.requestCalendarAccess().then(() => {
              store.ui.getCalendarAccess()
            })
          }}>
          <Text style={tw`text-accent text-xs`}>
            Click to grant calendar access
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!groupedEvents.length) {
    return null
  }

  return (
    <View style={tw`px-3 py-2 flex-row bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30`}>
      {groupedEvents.map(([key, data], i) => {
        return (
          <View key={key} style={tw`flex-row flex-1`}>
            <View style={tw`flex-1`}>
              <View style={tw.style(`flex-row`)}>
                {key === 'today' ? (
                  <Text
                    style={tw`capitalize dark:text-neutral-400 text-neutral-500 text-xs`}>
                    {key}
                  </Text>
                ) : (
                  <Text
                    style={tw.style(`capitalize dark:text-neutral-400 text-neutral-500 text-xs`, {
                      'dark:text-neutral-600 text-neutral-400': !data.events.length
                    })}>
                    {`${data.date.toFormat('ccc dd')}`}
                  </Text>
                )}
              </View>
              <ScrollView
                style={tw`mt-1 max-h-49`}
                showsVerticalScrollIndicator={false}>
                {data.events.map((event, index) => {
                  const lDate = DateTime.fromISO(event.date)
                  const lEndDate = event.endDate
                    ? DateTime.fromISO(event.endDate)
                    : null
                  const storeIndex = store.ui.filteredEvents.findIndex(
                    e => e.id === event.id && e.date === event.date,
                  )
                  const highlighted =
                    focused && store.ui.selectedIndex === storeIndex

                  return (
                    <View
                      key={index}
                      style={tw.style(`my-1`, {
                        'bg-accent bg-opacity-80 dark:bg-opacity-40 rounded-r': highlighted,
                        'rounded bg-opacity-10 p-0.5 border': event.isAllDay,
                        'border-l': !event.isAllDay,
                        borderColor: event.color
                      })}>
                      {!event.isAllDay && (
                        <Text
                          style={tw.style(
                            `text-gray-500 dark:text-gray-400 ml-1 text-xs`,
                            {
                              'text-white': highlighted,
                            },
                          )}>
                          <Text
                            style={tw.style(
                              `text-gray-800 dark:text-gray-200`,
                              {
                                'text-white': highlighted,
                              },
                            )}>
                            {lDate.toFormat('HH:mm')}
                          </Text>
                          {!!lEndDate
                            ? ` - ${lEndDate.toFormat('HH:mm')}`
                            : 'null'}
                        </Text>
                      )}

                      <Text
                        numberOfLines={1}
                        style={tw.style(`text-xs ml-1`, {
                          'text-white': highlighted,
                          'line-through': event.declined,
                          'font-semibold': !event.isAllDay
                        })}>
                        {event.title}
                      </Text>
                    </View>
                  )
                })}
                {/* {data.notShown > 0 && (
                  <Text style={tw`text-gray-600 text-xs ml-2`}>
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
