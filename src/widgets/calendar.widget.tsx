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
    <View style={tw`mx-3 my-2 flex-row`}>
      {groupedEvents.map(([key, data], i) => {
        return (
          <View key={key} style={tw`flex-row flex-1`}>
            <View style={tw`flex-1`}>
              <View
                style={tw.style(
                  `flex-row pl-1 dark:border-darkBorder border-lightBorder`,
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
                    style={tw`text-gray-400 dark:text-gray-400 text-xs ml-1`}>
                    No Events
                  </Text>
                )}
                {data.events.map((event, index) => {
                  const lDate = DateTime.fromISO(event.date)
                  const lEndDate = event.endDate
                    ? DateTime.fromISO(event.endDate)
                    : null

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
                        'bg-accent bg-opacity-80 dark:bg-opacity-40 rounded-r':
                          highlighted,
                        borderColor: event.color,
                      })}>
                      <Text
                        style={tw.style(
                          `text-gray-500 dark:text-gray-400 ml-1 text-xs`,
                          {
                            'text-white': highlighted,
                          },
                        )}>
                        <Text
                          style={tw.style(`text-gray-800 dark:text-gray-200`, {
                            'text-white': highlighted,
                          })}>
                          {lDate.toFormat('HH:mm')}
                        </Text>
                        {!!lEndDate
                          ? ` - ${lEndDate.toFormat('HH:mm')}`
                          : 'null'}
                      </Text>

                      <Text
                        minimumFontScale={0.8}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={tw.style(`ml-1 text-xs font-semibold`, {
                          'text-white': highlighted,
                          'line-through': event.declined,
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
