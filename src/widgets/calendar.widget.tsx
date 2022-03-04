import {INativeEvent} from 'lib/SolNative'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Image, StyleProp, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import inbox from '../assets/inbox.png'

interface IProps {
  style?: StyleProp<ViewStyle>
}

export const CalendarWidget: FC<IProps> = observer(({style}) => {
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
    <View
      style={tw.style(
        `px-6 py-3 w-1/2 h-44 text-gray-200`,
        // @ts-ignore
        style,
      )}>
      {/* <TouchableOpacity style={tw`flex-1`} onPress={onPress}> */}
      {!store.ui.minimalistMode && (
        <Text style={tw`pb-1 text-xs font-medium text-gray-400`}>Calendar</Text>
      )}
      {Object.entries(groups).map(([key, data]) => {
        return (
          <View key={key} style={tw`pb-2`}>
            <View style={tw`flex-row`}>
              <Text
                style={tw`capitalize font-medium dark:text-gray-200 text-gray-600 text-xs`}>
                {key}
              </Text>
              <Text style={tw`dark:text-gray-400 text-gray-400 text-xs pl-2`}>
                {key !== 'today' && `${data.date.toFormat('cccc')}, `}
                {data.date.toFormat('dd LLL')}
              </Text>
            </View>
            {data.events.map((event, index) => {
              const lDate = DateTime.fromISO(event.date)
              const lEndDate = event.endDate
                ? DateTime.fromISO(event.endDate)
                : null
              return (
                <View
                  key={index}
                  style={tw.style(`flex-row py-2 px-4 rounded items-center`, {
                    'bg-highlight dark:bg-gray-500 bg-opacity-30':
                      focused &&
                      store.ui.selectedIndex ===
                        store.ui.events.findIndex(e => e.title === event.title),
                  })}>
                  <View
                    style={tw.style(
                      `w-[15px] h-[15px] border-2 mr-2 rounded-full justify-center items-center`,
                      {
                        borderColor: event.color,
                      },
                    )}>
                    {event.status === 1 && (
                      // <Text
                      //   style={tw.style('text-sm font-bold', {
                      //     color: event.color,
                      //   })}>
                      //   ✓
                      // </Text>
                      <View
                        style={tw.style(`w-[8px] h-[8px] rounded-full`, {
                          backgroundColor: event.color,
                        })}
                      />
                    )}
                  </View>
                  <Text style={tw`text-gray-500 dark:text-gray-400 w-26`}>
                    {event.isAllDay ? (
                      'All day'
                    ) : (
                      <>
                        <Text style={tw`text-gray-800 dark:text-gray-200`}>
                          {lDate.toFormat('HH:mm')}{' '}
                        </Text>
                        {lEndDate && !event.isAllDay
                          ? `- ${lEndDate.toFormat('HH:mm')}`
                          : null}
                      </>
                    )}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={tw.style({'line-through': event.status === 2})}>
                    {event.title}
                  </Text>
                </View>
              )
            })}
          </View>
        )
      })}
      {!store.ui.events.length && (
        <View
          style={tw.style(`text-gray-500 items-center justify-center flex-1`)}>
          <Image source={inbox} style={tw`h-10`} resizeMode="contain" />
        </View>
      )}
      {/* </TouchableOpacity> */}
    </View>
  )
})
