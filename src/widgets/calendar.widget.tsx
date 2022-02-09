import {useBoolean} from 'hooks'
import {CONSTANTS} from 'lib/constants'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC, useRef} from 'react'
import {
  Animated,
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

const MEETING_PROVIDERS_URLS = [
  'https://us06web.zoom.us',
  'https://meet.google.com',
  'https://meet.ffmuc.net',
]

interface IProps {
  style: StyleProp<ViewStyle>
}

function extractLinkFromDescription(text: string) {
  const link = text
    .replace(/\n/g, ` `)
    .split(` `)
    .filter(token => CONSTANTS.REGEX_VALID_URL.test(token))
    .find(link =>
      MEETING_PROVIDERS_URLS.some(baseUrl => link.includes(baseUrl)),
    )

  return link
}

export const CalendarWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const focused = store.ui.focusedWidget === FocusableWidget.CALENDAR

  const filteredEvents = store.ui.events.filter(e => !e.isAllDay)
  const nextEvent = filteredEvents[0]
  const lDate = nextEvent?.date ? DateTime.fromISO(nextEvent.date) : null
  let eventLink = nextEvent?.url
  if (!eventLink && nextEvent?.notes) {
    eventLink = extractLinkFromDescription(nextEvent?.notes)
  }

  const onPress = () => {
    if (eventLink) {
      Linking.openURL(eventLink)
    } else {
      Linking.openURL('ical://')
    }
  }

  return (
    <View
      style={tw.style(
        `p-3 rounded-lg border border-gray-100 dark:border-gray-600 w-[180px]`,
        {
          'bg-light dark:bg-dark': !focused,
          'dark:bg-gray-800': focused,
        },
        // @ts-ignore
        style,
      )}>
      <TouchableOpacity style={tw`flex-1`} onPress={onPress}>
        {!store.ui.minimalistMode && (
          <Text style={tw`pb-3 text-xs text-gray-400`}>Calendar</Text>
        )}
        {nextEvent && (
          <View>
            <View style={tw`flex-row items-center`}>
              <View
                style={tw.style(`w-2 h-2 mr-2 rounded-full`, {
                  backgroundColor: nextEvent.color,
                })}
              />
              <Text
                style={tw`font-medium flex-shrink-1 dark:text-white`}
                numberOfLines={2}>
                {nextEvent.title}
              </Text>
            </View>
            <Text style={tw`text-sm dark:text-gray-400`}>
              {lDate?.toRelative() ?? ''}
            </Text>
            <View style={{flex: 1}} />
            {!!eventLink && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  textAlign: 'right',
                  color: '#1e5cc6',
                }}>
                Join →
              </Text>
            )}
          </View>
        )}
        {!nextEvent && (
          <View>
            <Text style={tw`text-sm dark:text-gray-400`}>
              No Upcoming Event
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
})
