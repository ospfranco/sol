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
        `pt-3 w-1/2 text-gray-200`,
        // @ts-ignore
        style,
      )}>
      {Object.entries(groups).map(([key, data]) => {
        return (
          <View key={key} style={tw`pb-2`}>
            <View style={tw`flex-row pb-1 px-6`}>
              <Text
                style={tw`capitalize font-medium dark:text-gray-200 text-gray-600 text-xs`}>
                {key}
              </Text>
              <Text style={tw`dark:text-gray-400 text-gray-400 text-xs pl-2`}>
                {key !== 'today' && `${data.date.toFormat('cccc')}, `}
                {data.date.toFormat('dd LLL')}
              </Text>
            </View>
            <View style={tw`px-4`}>
              {data.events.map((event, index) => {
                const lDate = DateTime.fromISO(event.date)
                const lEndDate = event.endDate
                  ? DateTime.fromISO(event.endDate)
                  : null
                return (
                  <View
                    key={index}
                    style={tw.style(
                      `flex-row py-2 px-3 rounded items-center border border-transparent`,
                      {
                        'bg-highlight dark:bg-gray-500 bg-opacity-30 border-lightBorder dark:border-darkBorder':
                          focused &&
                          store.ui.selectedIndex ===
                            store.ui.events.findIndex(
                              e => e.title === event.title,
                            ),
                      },
                    )}>
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
                    <Text
                      numberOfLines={1}
                      style={tw.style(`flex-1`, {
                        'line-through': event.status === 2,
                      })}>
                      {event.title}
                    </Text>
                    <Text
                      style={tw`text-gray-500 dark:text-gray-400 text-right text-sm`}>
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
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
      {!store.ui.events.length && (
        <Image
          source={inbox}
          style={tw`h-10 self-center my-10`}
          resizeMode="contain"
        />
      )}
      {/* </TouchableOpacity> */}
    </View>
  )
})
