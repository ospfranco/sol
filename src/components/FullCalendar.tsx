import clsx from 'clsx'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { FC, useCallback, useMemo } from 'react'
import { Linking, Text, TouchableWithoutFeedback, View } from 'react-native'
import { useStore } from 'store'
import { Key } from './Key'
import { useBoolean } from 'hooks'
import { LoadingBar } from './LoadingBar'
import { LegendList } from '@legendapp/list'

const CalendarItem = ({ item }: { item: INativeEvent }) => {
  let store = useStore()
  let [hovered, hoverOn, hoverOff] = useBoolean()
  let lStart = DateTime.fromISO(item.date)

  let pressCallback = useCallback(() => {
    try {
      if (item.eventLink) {
        Linking.openURL(item.eventLink)
      } else {
        Linking.openURL('ical://' + item.id)
      }
    } catch (error) {
      console.error('Failed to open calendar event:', error)
    }
  }, [item])

  const style = useMemo(() => {
    return {
      backgroundColor: item.color,
    }
  }, [item])

  return (
    <TouchableWithoutFeedback
      // @ts-expect-error
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      onPress={pressCallback}>
      <View
        className={clsx(
          'flex-row items-center gap-1 mx-2 px-2 py-1 rounded-lg',
          {
            'bg-accent': hovered,
          },
        )}>
        <View
          className={clsx(`rounded-full justify-center items-center`, {
            'h-2 w-2 mx-1 rotate-45': item.status === 1,
            'h-2 w-2 mx-1': item.status !== 1,
            'rounded-sm': item.isAllDay,
          })}
          style={style}
        />

        <Text
          numberOfLines={1}
          className={clsx(
            'flex-1 pr-10 text-sm dark:text-stone-300 text-neutral-600',
            {
              'font-semibold': store.calendar.upcomingEvent?.id === item.id,
              'text-white': hovered,
            },
          )}>
          {item.title?.trim()}
        </Text>

        {!item.isAllDay && (
          <Text
            className={clsx('dark:text-neutral-400 text-xxs', {
              'text-white dark:text-white': hovered,
            })}
            style={{
              fontFamily: 'JetBrains Mono',
            }}>
            {lStart.hasSame(DateTime.now(), 'day') &&
              lStart > DateTime.now() && (
                <Text>
                  {'in '}
                  {lStart.diffNow(['hours', 'minutes']).hours >= 1
                    ? `${Math.floor(
                      lStart.diffNow(['hours', 'minutes']).hours,
                    )}h `
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

const RenderItem = ({ item }: any) => {
  return (
    <View>
      <View className="mx-3 p-2 gap-1">
        <Text className="capitalize text-neutral-400 dark:text-neutral-500 text-sm">
          {item.date.toRelativeCalendar({
            unit: 'days',
          })}
        </Text>
      </View>
      {item.data.map((item: INativeEvent) => (
        <CalendarItem key={item.id} item={item} />
      ))}
    </View>
  )
}

export let FullCalendar: FC = observer(() => {
  let store = useStore()

  if (store.ui.calendarAuthorizationStatus !== 'authorized') {
    return null
  }

  const groupedEvents = store.calendar.groupedEvents

  return (
    <>
      <LoadingBar />
      <LegendList
        data={groupedEvents}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyExtractor={section => section.date.toString()}
        renderItem={RenderItem}
        contentContainerStyle={{ flexGrow: 1 }}
        recycleItems
      />
      {store.calendar.upcomingEvent &&
        <View className="subBg flex-row items-center justify-end gap-1 py-2 px-4">
          <Text className={'text-xs darker-text mr-1'}>
            Open Upcoming Event "{store.calendar.upcomingEvent.title?.substring(0, 20)}"
          </Text>
          <Key symbol={'⏎'} />
        </View>
      }
    </>
  )
})
