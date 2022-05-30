import {Assets} from 'assets'
import {INativeEvent, solNative} from 'lib/SolNative'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Image, Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const CalendarWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const focused = store.ui.focusedWidget === FocusableWidget.CALENDAR

  const groups = store.ui.events.slice(0, 3).reduce((acc, event) => {
    const lDate = DateTime.fromISO(event.date)
    const relativeDate = lDate.toRelativeCalendar()!

    if (!acc[relativeDate]) {
      acc[relativeDate] = {date: lDate, events: [event]}
    } else {
      acc[relativeDate].events.push(event)
    }
    return acc
  }, {} as Record<string, {date: DateTime; events: Array<INativeEvent>}>)

  return (
    <>
      <View>
        {Object.entries(groups).map(([key, data]) => {
          return (
            <View key={key}>
              <View style={tw`flex-row`}>
                {key === 'tomorrow' || key === 'today' ? (
                  <Text
                    style={tw`capitalize dark:text-gray-400 text-gray-500 text-xs`}>
                    {key}
                  </Text>
                ) : (
                  <Text
                    style={tw`capitalize dark:text-gray-400 text-gray-500 text-xs`}>
                    {key !== 'today' && `${data.date.toFormat('cccc')} `}
                    <Text
                      style={tw`capitalize dark:text-gray-400 text-gray-500 text-xs`}>
                      {'- '}
                      {data.date.toFormat('dd LLL')}
                    </Text>
                  </Text>
                )}
              </View>
              <View style={tw`pl-2`}>
                {data.events.map((event, index) => {
                  const lDate = DateTime.fromISO(event.date)
                  const lEndDate = event.endDate
                    ? DateTime.fromISO(event.endDate)
                    : null

                  const highlighted =
                    focused &&
                    store.ui.selectedIndex ===
                      store.ui.events.findIndex(
                        e => e.id === event.id && e.date === event.date,
                      )

                  return (
                    <View
                      key={index}
                      style={tw.style(`flex-row py-2 px-2 items-center`, {
                        'bg-accent bg-opacity-80 dark:bg-opacity-40 rounded':
                          highlighted,
                      })}>
                      {event.status !== 1 && (
                        <View
                          style={tw.style(
                            `w-[12px] h-[12px] rounded-full justify-center items-center`,
                            {
                              borderColor: event.color,
                              borderWidth: 1.5,
                            },
                          )}
                        />
                      )}
                      {/* Event is accepted */}
                      {event.status === 1 && (
                        <Image
                          source={Assets.CheckCircleIcon}
                          style={tw.style('h-[12px] w-[12px]', {
                            tintColor: event.color,
                          })}
                          resizeMode="cover"
                          resizeMethod="resize"
                        />
                      )}
                      <Text
                        numberOfLines={1}
                        style={tw.style(`ml-2 flex-1 text-xs`, {
                          'line-through': event.status === 2,
                          'text-white': highlighted,
                        })}>
                        {event.title}
                      </Text>
                      <Text
                        style={tw.style(
                          `text-gray-500 dark:text-gray-400 text-right text-xs`,
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
        {store.ui.calendarAuthorizationStatus === 'notDetermined' && (
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
        )}
        {store.ui.calendarAuthorizationStatus === 'authorized' &&
          !store.ui.events.length && (
            <Text style={tw`pb-1 text-gray-500 dark:text-gray-400 text-xs`}>
              No upcoming events
            </Text>
          )}
      </View>
    </>
  )
})
