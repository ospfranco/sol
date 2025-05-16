import clsx from 'clsx'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {ScrollView, Text, View} from 'react-native'
import {useStore} from 'store'
import {Key} from './Key'

export let FullCalendar: FC = observer(() => {
  let store = useStore()

  if (store.ui.calendarAuthorizationStatus !== 'authorized') {
    return null
  }

  return (
    <ScrollView
      className="max-h-full border-t border-lightBorder dark:border-darkBorder"
      contentContainerClassName="py-2 gap-2 px-4"
      showsVerticalScrollIndicator={false}>
      {Object.entries(store.calendar.groupedEvents).map(([key, group]) => {
        let shouldShowRelative = group.date.diffNow('days').days <= 5
        return (
          <View
            key={key}
            className="py-2 gap-2 border-b border-lightBorder dark:border-darkBorder">
            <View className="flex-row items-center gap-1">
              <Text className="capitalize font-medium text-neutral-500 dark:text-neutral-400">
                {shouldShowRelative
                  ? group.date.toRelativeCalendar()
                  : group.date.toFormat('dd MMM')}
              </Text>
              <Text className="capitalize text-neutral-400 dark:text-neutral-500 font-normal">
                | {group.date.toFormat(shouldShowRelative ? 'ccc dd' : 'ccc')}
              </Text>
            </View>
            {group.events.map(event => {
              let lStart = DateTime.fromISO(event.date)
              let lEnd = DateTime.fromISO(event.endDate)

              return (
                <View
                  className="flex-row items-center gap-1"
                  key={`${event.id}-${event.date}`}>
                  <View
                    className={clsx(
                      'rounded-full justify-center items-center',
                      {
                        'h-2 w-2 mx-1 rotate-45': event.status === 1,
                        'h-2 w-2 mx-1': event.status !== 1,
                        'rounded-sm': event.isAllDay,
                      },
                    )}
                    style={{
                      backgroundColor: event.color,
                    }}
                  />

                  <Text
                    numberOfLines={1}
                    className={clsx('flex-1 pr-10', {
                      'line-through': event.declined || event.eventStatus === 3,
                      'font-semibold':
                        store.calendar.upcomingEvent?.id === event.id,
                    })}>
                    {event.title?.trim()}
                  </Text>

                  {store.calendar.upcomingEvent?.id === event.id &&
                    event.eventStatus !== 3 &&
                    !!store.calendar.upcomingEvent.eventLink && (
                      <Key
                        className="mr-2"
                        title={'Join'}
                        symbol="return"
                        primary
                      />
                    )}
                  {!event.isAllDay && (
                    <Text
                      className="dark:text-neutral-400"
                      style={{
                        fontFamily: 'JetBrains Mono',
                      }}>
                      <Text className="dark:text-white ">
                        {lStart.toFormat('HH:mm')}
                      </Text>{' '}
                      {'→'} {lEnd.toFormat('HH:mm')}
                    </Text>
                  )}
                  {/* {event.isAllDay && (
                    <Text className="text-neutral-500">All day</Text>
                  )} */}
                </View>
              )
            })}
          </View>
        )
      })}
    </ScrollView>
  )
})
