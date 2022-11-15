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
      <View style={tw`pt-1 px-3`}>
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
    <View
      style={tw`px-3 py-2 flex-row bg-neutral-100 dark:bg-black bg-opacity-50`}>
      {groupedEvents.map(([key, data], i) => {
        return (
          <View key={key} style={tw`flex-row flex-1`}>
            <View style={tw`flex-1`}>
              <View style={tw.style(`flex-row`)}>
                {key === 'today' || key === 'tomorrow' ? (
                  <Text
                    style={tw`uppercase dark:text-neutral-600 text-neutral-400 text-xxs`}>
                    {key}
                  </Text>
                ) : (
                  <Text
                    style={tw.style(
                      `uppercase dark:text-neutral-600 text-neutral-400 text-xxs`,
                    )}>
                    {`${data.date.toFormat('cccc')}`}
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
                      style={tw.style(
                        `flex-row items-center my-1 px-1 border border-transparent rounded`,
                        {
                          'bg-gray-200 dark:bg-proGray-900 border-gray-300 dark:border-neutral-700':
                            highlighted,
                          'p-0.5': event.isAllDay,
                          // borderColor: event.color,
                        },
                      )}>
                      <View
                        style={tw.style(`h-1 w-1 rounded-full`, {
                          backgroundColor: event.color,
                        })}
                      />
                      {!event.isAllDay && (
                        <Text
                          style={tw.style(
                            `text-neutral-500 dark:text-neutral-400 text-xs ml-1`,
                          )}>
                          {lDate.toFormat('HH:mm')}
                        </Text>
                      )}
                      <Text
                        numberOfLines={1}
                        style={tw.style(`text-xs ml-1`, {
                          'line-through': event.declined,
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
