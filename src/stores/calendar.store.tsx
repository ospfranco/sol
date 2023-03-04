import AsyncStorage from '@react-native-async-storage/async-storage'
import {extractMeetingLink} from 'lib/calendar'
import {solNative} from 'lib/SolNative'
import {sleep} from 'lib/various'
import {DateTime} from 'luxon'
import {autorun, makeAutoObservable, toJS} from 'mobx'
import {EmitterSubscription, Linking} from 'react-native'
import {IRootStore} from 'Store'

let onShowListener: EmitterSubscription | undefined
let onStatusBarItemClickListener: EmitterSubscription | undefined

export type CalendarStore = ReturnType<typeof createCalendarStore>

export const createCalendarStore = (root: IRootStore) => {
  const persist = async () => {
    const plainState = toJS(store)

    AsyncStorage.setItem('@calendar.store', JSON.stringify(plainState))
  }

  let hydrate = async () => {
    const storeState = await AsyncStorage.getItem('@ui.store')

    if (storeState) {
      // let parsedStore = JSON.parse(storeState)
      // runInAction(() => {
      // })
    }
  }

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
      return store.events.find(e => {
        return DateTime.fromISO(e.date).diffNow('minutes').minutes < 10
      })
    },
    get groupedEvents(): Record<
      string,
      {date: DateTime; events: Array<INativeEvent>}
    > {
      const events = store.filteredEvents
      let acc: Record<string, {date: DateTime; events: Array<INativeEvent>}> =
        {}
      for (let ii = 0; ii < 3; ii++) {
        const now = DateTime.now().plus({days: ii})
        // console.warn(now.toFormat('DD'))
        const relativeNow = now.toRelativeCalendar({unit: 'days'})!
        const todayEvents = events.filter(e => {
          const lEventDate = DateTime.fromISO(e.date)
          const lEventEndDate = DateTime.fromISO(e.endDate)
          if (e.isAllDay && +now >= +lEventDate && +now <= +lEventEndDate) {
            return true
          }
          return lEventDate.toRelativeCalendar({unit: 'days'})! === relativeNow
        })

        acc[relativeNow] = {
          date: now,
          events: todayEvents,
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
          if (!root.ui.showAllDayEvents) {
            notFiltered = notFiltered && !e.isAllDay
          }

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
      if (!root.ui.calendarEnabled) {
        return
      }

      if (store.calendarAuthorizationStatus !== 'authorized') {
        // Cannot fetch events
        return
      }

      store.events = solNative.getEvents()

      if (store.events[0]) {
        const latest = store.events[0]
        const lStart = DateTime.fromISO(latest.date)
        const relative = lStart
          .toRelative()
          ?.replace(' hours', 'h')
          .replace(' mins', 'm')
          .replace(' days', 'd')
        solNative.setStatusBarItemTitle(`${latest.title?.trim()} ${relative}`)
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

      store.fetchEvents()
      await sleep(10000)
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
      const event = store.events[0]
      if (event) {
        let eventLink: string | null | undefined = event.url

        if (!eventLink) {
          eventLink = extractMeetingLink(event.notes, event.location)
        }

        if (eventLink) {
          Linking.openURL(eventLink)
        } else {
          Linking.openURL('ical://')
        }
      } else {
        Linking.openURL('ical://')
      }
    },
  })

  hydrate().then(() => {
    autorun(persist)
    store.getCalendarAccess()
    if (root.ui.calendarEnabled) {
      store.poll()
    }
  })

  onShowListener = solNative.addListener('onShow', store.onShow)
  onStatusBarItemClickListener = solNative.addListener(
    'onStatusBarItemClick',
    store.onStatusBarItemClick,
  )

  return store
}
