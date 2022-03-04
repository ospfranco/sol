import {CONSTANTS} from 'lib/constants'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {
  Image,
  Linking,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
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
      acc[relativeDate] = [event]
    } else {
      acc[relativeDate].push(event)
    }
    return acc
  }, {} as Record<string, Array<any>>)

  return (
    <View
      style={tw.style(
        `p-3 w-1/2 h-48 text-gray-200 dark:border-highlightDark`,
        // @ts-ignore
        style,
      )}>
      {/* <TouchableOpacity style={tw`flex-1`} onPress={onPress}> */}
      {!store.ui.minimalistMode && (
        <Text style={tw`pb-1 text-xs font-medium text-gray-400`}>Calendar</Text>
      )}
      {Object.entries(groups).map(([key, events]) => {
        return (
          <View key={key}>
            <Text
              style={tw`capitalize font-medium pb-2 dark:text-gray-400 text-gray-500`}>
              {key}
            </Text>
            {events.map((event, index) => {
              const lDate = DateTime.fromISO(event.date)
              const lEndDate = event.endDate
                ? DateTime.fromISO(event.endDate)
                : null
              return (
                <View
                  key={index}
                  style={tw.style(`flex-row py-2 px-4 rounded items-center`, {
                    'bg-highlight dark:bg-highlightDark':
                      focused && store.ui.selectedIndex === index,
                  })}>
                  <View
                    style={tw.style(
                      `w-[15px] h-[15px] border-2 mr-2 rounded-full`,
                      {
                        borderColor: event.color,
                      },
                    )}
                  />
                  <Text style={tw`text-gray-500 dark:text-gray-400 pl-2`}>
                    {event.isAllDay ? 'All day, ' : null}
                    <Text style={tw`text-gray-800 dark:text-gray-200`}>
                      {lDate.toFormat('HH:mm')}{' '}
                    </Text>
                    {lEndDate && !event.isAllDay
                      ? `- ${lEndDate.toFormat('HH:mm')}`
                      : null}
                  </Text>
                  <Text style={tw`pl-4`} numberOfLines={1}>
                    {event.title}
                  </Text>
                </View>
              )
            })}
          </View>
        )
      })}
      {/* {store.ui.events.slice(0, 3).map((event, index) => {
        const lDate = DateTime.fromISO(event.date)
        const lEndDate = event.endDate ? DateTime.fromISO(event.endDate) : null
        return (
          <View
            key={index}
            style={tw.style(`flex-row py-1 px-3 rounded items-center`, {
              'bg-gray-200 dark:bg-highlightDark':
                focused && store.ui.selectedIndex === index,
            })}>
            <View
              style={tw.style(`w-1 h-full mr-2 rounded-xs`, {
                backgroundColor: event.color,
              })}
            />
            <View>
              <Text
                style={tw`font-medium flex-shrink-1 dark:text-white`}
                numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={tw`pt-1 text-sm text-gray-500 dark:text-gray-400`}>
                {event.isAllDay ? 'All day, ' : null}
                {lDate.toRelative()} at {lDate.toFormat('HH:mm')}
                {lEndDate && !event.isAllDay
                  ? `, ${lEndDate.diff(lDate, 'minutes').minutes} mins.`
                  : null}
              </Text>
            </View>
          </View>
        )
      })} */}
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
