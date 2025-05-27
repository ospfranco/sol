import clsx from 'clsx'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import {FC} from 'react'
import {
  Linking,
  SectionList,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {useStore} from 'store'
import {Key} from './Key'
import {useBoolean} from 'hooks'
import {LoadingBar} from './LoadingBar'

const CalendarItem = ({item}: {item: INativeEvent}) => {
  let store = useStore()
  let [hovered, hoverOn, hoverOff] = useBoolean()
  let lStart = DateTime.fromISO(item.date)
  // let lEnd = DateTime.fromISO(item.endDate)

  return (
    <TouchableWithoutFeedback
      // @ts-expect-error
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      onPress={() => {
        try {
          if (item.eventLink) {
            Linking.openURL(item.eventLink)
          } else {
            Linking.openURL('ical://' + item.id)
          }
        } catch (error) {
          console.error('Failed to open calendar event:', error)
        }
      }}>
      <View
        className={clsx('flex-row items-center gap-1 mx-1 px-2 py-1 rounded', {
          'bg-accent': hovered,
        })}>
        <View
          className={clsx('rounded-full justify-center items-center', {
            'h-2 w-2 mx-1 rotate-45': item.status === 1,
            'h-2 w-2 mx-1': item.status !== 1,
            'rounded-sm': item.isAllDay,
          })}
          style={{
            backgroundColor: item.color,
          }}
        />

        <Text
          numberOfLines={1}
          className={clsx(
            'flex-1 pr-10 text-sm dark:text-stone-300 text-neutral-600',
            {
              'line-through': item.declined || item.eventStatus === 3,
              'font-semibold': store.calendar.upcomingEvent?.id === item.id,
            },
          )}>
          {item.title?.trim()}
        </Text>

        {store.calendar.upcomingEvent?.id === item.id &&
          item.eventStatus !== 3 &&
          !!store.calendar.upcomingEvent.eventLink && (
            <Key className="mr-2" title={'Join'} symbol="return" primary />
          )}

        {!item.isAllDay && (
          <Text
            className="dark:text-neutral-400 text-xxs"
            style={{
              fontFamily: 'JetBrains Mono',
            }}>
            {lStart.hasSame(DateTime.now(), 'day') &&
              lStart > DateTime.now() && (
                <Text>
                  {'  in '}
                  {lStart.diffNow(['hours', 'minutes']).hours >= 1
                    ? `${Math.floor(lStart.diffNow('minutes').hours)}h `
                    : ''}
                  {lStart.diffNow('minutes').minutes > 0
                    ? `${Math.round(lStart.diffNow('minutes').minutes % 60)}m`
                    : ''}
                </Text>
              )}{' '}
            <Text className="dark:text-white text-black font-semibold">
              {lStart.toFormat('HH:mm')}
            </Text>
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

export let FullCalendar: FC = observer(() => {
  let store = useStore()

  if (store.ui.calendarAuthorizationStatus !== 'authorized') {
    return null
  }

  const groupedEvents = store.calendar.groupedEvents

  const renderItem = ({item}: {item: INativeEvent}) => {
    return <CalendarItem item={item} />
  }

  return (
    <>
      <LoadingBar />
      <SectionList
        sections={groupedEvents}
        renderSectionHeader={({section}) => {
          let isToday = section.date.hasSame(DateTime.now(), 'day')
          let shouldShowRelative = section.date.diffNow('days').days <= 5

          return (
            <View className="mx-2 p-2 mb-1 gap-1 border-b border-lightBorder dark:border-darkBorder">
              <Text className="capitalize text-neutral-400 dark:text-neutral-500 text-sm">
                {isToday
                  ? 'Today'
                  : shouldShowRelative
                  ? section.date.toRelativeCalendar({
                      unit: 'days',
                    })
                  : section.date.toFormat('cccc dd')}
              </Text>
            </View>
          )
        }}
        renderItem={renderItem}
      />
    </>
  )
})
