import {captureException} from '@sentry/react-native'
import {extractMeetingLink} from 'lib/calendar'
import {solNative} from 'lib/SolNative'
import {sleep} from 'lib/various'
import {DateTime} from 'luxon'
import {makeAutoObservable} from 'mobx'
import {EmitterSubscription, Linking} from 'react-native'
import {IRootStore} from 'store'

const DAYS_TO_PARSE = 14

let onShowListener: EmitterSubscription | undefined
let onStatusBarItemClickListener: EmitterSubscription | undefined

export type CalendarStore = ReturnType<typeof createCalendarStore>

export const createCalendarStore = (root: IRootStore) => {
  let store = makeAutoObservable({
    //    ____  _                              _     _
    //   / __ \| |                            | |   | |
    //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
    //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
    //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
    //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/

    calendarAuthorizationStatus: 'notDetermined' as CalendarAuthorizationStatus,
    keepPolling: true,
    events: [] as INativeEvent[],

    //    _____                            _           _
    //   / ____|                          | |         | |
    //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
    //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
    //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
    //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
    //                        | |
    //                        |_|

    get upcomingEvent(): INativeEvent | undefined {
      let found = store.events.find(e => {
        const lStart = DateTime.fromISO(e.date)
        const lNow = DateTime.now()

        return (
          +lStart.plus({minutes: 20}) >= +lNow &&
          +lStart.diffNow('minutes').minutes <= 15
        )
      })

      if (found) {
        let eventLink: string | null | undefined = found.url

        if (!eventLink) {
          eventLink = extractMeetingLink(found.notes, found.location)
        }

        return {...found, eventLink}
      }
    },
    get groupedEvents(): Record<
      string,
      {date: DateTime; events: Array<INativeEvent>}
    > {
      const events = store.events
      let acc: Record<string, {date: DateTime; events: Array<INativeEvent>}> =
        {}
      let now = DateTime.now().startOf('day')
      for (let ii = 0; ii < DAYS_TO_PARSE; ii++) {
        const targetDate = now.plus({days: ii})

        const todayEvents = events.filter(e => {
          const lEventDate = DateTime.fromISO(e.date)
          const lEventEndDate = DateTime.fromISO(e.endDate)

          if (
            e.isAllDay &&
            +targetDate >= +lEventDate &&
            +targetDate <= +lEventEndDate
          ) {
            return true
          }

          return lEventDate.toISODate() === targetDate.toISODate()
        })

        if (todayEvents.length > 0) {
          acc[targetDate.toISODate()] = {
            date: targetDate,
            events: todayEvents,
          }
        }
      }

      return acc
    },
    get filteredEvents(): INativeEvent[] {
      const events = store.events
      return events.filter(e => {
        if (!!root.ui.query) {
          return e.title?.toLowerCase().includes(root.ui.query.toLowerCase())
        } else {
          let notFiltered = e.status !== 3 && !e.declined

          return notFiltered
        }
      })
    },
    //                _   _
    //      /\       | | (_)
    //     /  \   ___| |_ _  ___  _ __  ___
    //    / /\ \ / __| __| |/ _ \| '_ \/ __|
    //   / ____ \ (__| |_| | (_) | | | \__ \
    //  /_/    \_\___|\__|_|\___/|_| |_|___/
    fetchEvents: () => {
      if (!root.ui.calendarEnabled && !root.ui.showUpcomingEvent) {
        solNative.setStatusBarItemTitle('')
        return
      }

      if (store.calendarAuthorizationStatus !== 'authorized') {
        // Cannot fetch events
        return
      }

      const events = solNative.getEvents()

      if (root.ui.calendarEnabled) {
        store.events = events
      }

      if (root.ui.showUpcomingEvent) {
        const upcomingEvent = events.find(e => {
          const lStart = DateTime.fromISO(e.date)
          const lNow = DateTime.now()

          return (
            +lStart.plus({minute: 10}) >= +lNow && +lStart <= +lNow.endOf('day')
          )
        })

        if (!upcomingEvent) {
          solNative.setStatusBarItemTitle('')
          return
        }

        const lStart = DateTime.fromISO(upcomingEvent.date)
        const minutes = lStart.diffNow('minutes').minutes

        if (minutes <= 0) {
          solNative.setStatusBarItemTitle(`⏰ ${upcomingEvent.title?.trim()}`)
          return
        }

        const relativeHours = Math.floor(minutes / 60)
        const relativeHoursStr = relativeHours > 0 ? `${relativeHours}h` : ''
        const relativeMinutesStr = `${Math.floor(
          minutes - relativeHours * 60,
        )}m`

        solNative.setStatusBarItemTitle(
          `${upcomingEvent.title!.trim().substring(0, 18)}${
            upcomingEvent.title!.length > 18 ? '...' : ''
          } • ${relativeHoursStr} ${relativeMinutesStr}`,
        )
      }
    },
    cleanUp: () => {
      store.keepPolling = false
      onShowListener?.remove()
      onStatusBarItemClickListener?.remove()
    },
    poll: async () => {
      if (!store.keepPolling) {
        return
      }

      if (root.ui.calendarEnabled) {
        try {
          store.fetchEvents()
        } catch (e) {
          captureException(e)
        }
      }

      await sleep(1000)
      store.poll()
    },
    onShow: () => {
      store.fetchEvents()
    },
    getCalendarAccess: () => {
      store.calendarAuthorizationStatus =
        solNative.getCalendarAuthorizationStatus()
    },
    onStatusBarItemClick: () => {
      const event = root.calendar.filteredEvents[0]
      if (event) {
        let eventLink: string | null | undefined = event.url

        if (!eventLink) {
          eventLink = extractMeetingLink(event.notes, event.location)
        }

        if (eventLink) {
          try {
            Linking.openURL(eventLink)
          } catch (e) {
            solNative.showToast(
              `Failed to open event link: ${eventLink}`,
              'error',
            )
          }
        } else {
          Linking.openURL('ical://')
        }
      } else {
        Linking.openURL('ical://')
      }
    },
  })

  store.getCalendarAccess()

  store.poll()

  onShowListener = solNative.addListener('onShow', store.onShow)
  onStatusBarItemClickListener = solNative.addListener(
    'onStatusBarItemClick',
    store.onStatusBarItemClick,
  )

  return store
}
