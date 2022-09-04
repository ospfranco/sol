import {solNative} from 'lib/SolNative'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {ScrollView, Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const ExperimentalCalendarWidget: FC<Props> = observer(() => {
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
    <View style={tw`mx-1 py-2 flex-row`}>
      {groupedEvents.map(([key, data], i) => {
        return (
          <View key={key} style={tw`flex-row flex-1`}>
            <View style={tw`flex-1`}>
              <View
                style={tw.style(
                  `flex-row px-2 dark:border-darkBorder border-lightBorder`,
                  {
                    'border-l': i !== 0,
                  },
                )}>
                {key === 'today' ? (
                  <Text
                    style={tw`capitalize dark:text-white text-gray-500 text-xs`}>
                    {key}
                  </Text>
                ) : (
                  <Text
                    style={tw`capitalize dark:text-gray-400 text-gray-500 text-xs`}>
                    {`${data.date.toFormat('cccc')}`}
                  </Text>
                )}
              </View>
              <ScrollView
                style={tw`mt-1 max-h-49`}
                showsVerticalScrollIndicator={false}>
                {!data.events.length && (
                  <Text
                    style={tw`text-gray-400 dark:text-gray-600 text-xs ml-2`}>
                    No Events
                  </Text>
                )}
                {data.events.map((event, index) => {
                  const lDate = DateTime.fromISO(event.date)
                  const lEndDate = event.endDate
                    ? DateTime.fromISO(event.endDate)
                    : null
                  // const minutesToEvent = Math.round(
                  //   lDate.diff(DateTime.now(), 'minutes').minutes,
                  // )

                  const highlighted =
                    focused &&
                    store.ui.selectedIndex ===
                      store.ui.filteredEvents.findIndex(
                        e => e.id === event.id && e.date === event.date,
                      )

                  return (
                    <View
                      key={index}
                      style={tw.style(`my-1 border-l`, {
                        'bg-accent bg-opacity-80 dark:bg-opacity-40 rounded':
                          highlighted,
                        borderColor: event.color,
                      })}>
                      <View style={tw`flex-row items-center`}>
                        {/* <View
                          style={tw.style(
                            `w-2 h-2 rounded-full justify-center items-center`,
                            {
                              backgroundColor: event.color,
                            },
                          )}
                        /> */}

                        {/* <View
                          style={tw.style('h-full border-r', {
                            borderColor: event.color,
                          })}
                        /> */}

                        <Text
                          minimumFontScale={0.8}
                          adjustsFontSizeToFit
                          numberOfLines={1}
                          style={tw.style(`ml-1 text-sm`, {
                            'text-white': highlighted,
                          })}>
                          {event.title}
                        </Text>
                      </View>
                      {/* {minutesToEvent >= 0 && minutesToEvent <= 20 && (
                        <Text
                          style={tw`pl-2 dark:text-gray-500 text-gray-400 text-xs`}>
                          in {minutesToEvent} minutes
                        </Text>
                      )} */}
                      <Text
                        style={tw.style(
                          `text-gray-500 dark:text-gray-400 ml-1 text-xs`,
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
