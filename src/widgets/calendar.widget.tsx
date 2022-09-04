import {solNative} from 'lib/SolNative'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores/ui.store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const CalendarWidget: FC<Props> = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  const focused = store.ui.focusedWidget === FocusableWidget.CALENDAR

  const groupedEvents = Object.entries(store.ui.groupedEvents)

  if (store.ui.calendarAuthorizationStatus === 'notDetermined') {
    return (
      <View style={tw`p-2 mx-1`}>
        <TouchableOpacity
          onPress={() => {
            solNative.requestCalendarAccess().then(() => {
              store.ui.checkCalendarAccess()
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
    <View style={tw`mx-1 py-2`}>
      {groupedEvents.map(([key, data], index) => {
        return (
          <View key={key}>
            <View
              style={tw.style(`flex-row px-3`, {
                'mt-1': index !== 0,
              })}>
              {key === 'tomorrow' || key === 'today' ? (
                <Text
                  style={tw`capitalize dark:text-gray-400 text-gray-500 text-xs`}>
                  {key}
                </Text>
              ) : (
                <Text
                  style={tw`capitalize dark:text-gray-400 text-gray-500 text-xs`}>
                  {`${data.date.toFormat('cccc')}, ${data.date.toFormat(
                    'dd LLL',
                  )}`}
                </Text>
              )}
            </View>
            <View style={tw`mt-1`}>
              {data.events.map((event, index) => {
                const lDate = DateTime.fromISO(event.date)
                const lEndDate = event.endDate
                  ? DateTime.fromISO(event.endDate)
                  : null
                const minutesToEvent = Math.round(
                  lDate.diff(DateTime.now(), 'minutes').minutes,
                )

                const highlighted =
                  focused &&
                  store.ui.selectedIndex ===
                    store.ui.filteredEvents.findIndex(
                      e => e.id === event.id && e.date === event.date,
                    )

                return (
                  <View
                    key={index}
                    style={tw.style(`flex-row py-2 items-center mx-1 px-2`, {
                      'bg-accent bg-opacity-80 dark:bg-opacity-40 rounded':
                        highlighted,
                    })}>
                    <View
                      style={tw.style(
                        `w-2 h-2 rounded-full justify-center items-center`,
                        {
                          // borderColor: event.color,
                          // borderWidth: 1.5,
                          // 1 event accepted
                          backgroundColor:
                            // event.status === 1 ? event.color : 'transparent',
                            event.color,
                        },
                      )}
                    />

                    <Text
                      numberOfLines={1}
                      style={tw.style(`ml-2 text-sm`, {
                        'text-white': highlighted,
                      })}>
                      {event.title}
                    </Text>
                    {minutesToEvent >= 0 && minutesToEvent <= 20 && (
                      <Text
                        style={tw`pl-2 dark:text-gray-500 text-gray-400 text-sm`}>
                        in {minutesToEvent} minutes
                      </Text>
                    )}
                    <View style={tw`flex-1`} />
                    <Text
                      style={tw.style(
                        `text-gray-500 dark:text-gray-400 text-right text-sm`,
                        {
                          'text-white': highlighted,
                        },
                      )}>
                      {event.isAllDay ? (
                        'All Day'
                      ) : (
                        <>
                          <Text
                            style={tw.style(
                              `text-gray-800 dark:text-gray-200`,
                              {
                                'text-white': highlighted,
                              },
                            )}>
                            {lDate.toFormat('HH:mm')}{' '}
                          </Text>
                          {lEndDate && !event.isAllDay
                            ? `- ${lEndDate.toFormat('HH:mm')}`
                            : null}
                        </>
                      )}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
    </View>
  )
})
