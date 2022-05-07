import {Assets} from 'assets'
import {Parser} from 'expr-eval'
import Fuse from 'fuse.js'
import produce from 'immer'
import {extractMeetingLink} from 'lib/calendar'
import {CONSTANTS} from 'lib/constants'
import {
  CalendarAuthorizationStatus,
  INativeEvent,
  solNative,
} from 'lib/SolNative'
import {doubleTranslate} from 'lib/translator'
import {getWeather} from 'lib/weather'
import {DateTime} from 'luxon'
import {autorun, makeAutoObservable, runInAction, toJS} from 'mobx'
import React, {FC} from 'react'
import {
  Alert,
  Appearance,
  AsyncStorage,
  Clipboard,
  DevSettings,
  EmitterSubscription,
  Image,
  ImageURISource,
  Linking,
  Platform,
  Text,
  View,
} from 'react-native'
import {IRootStore} from 'Store'
import tw from 'tailwind'
import {buildSystemPreferencesItems} from './systemPreferences'
import * as Sentry from '@sentry/react-native'

let keyDownListener: EmitterSubscription | undefined
let keyUpListener: EmitterSubscription | undefined
let onShowListener: EmitterSubscription | undefined
let onHideListener: EmitterSubscription | undefined
let showScratchPadListener: EmitterSubscription | undefined

const exprParser = new Parser()

const FUSE_OPTIONS = {
  threshold: 0.2,
  ignoreLocation: true,
  keys: ['name'],
}

interface IPeriod {
  id: number
  start: number
  end?: number
}

interface ITrackingProject {
  id: string
  name: string
  periods: IPeriod[]
}

export enum FocusableWidget {
  ONBOARDING = 'ONBOARDING',
  SEARCH = 'SEARCH',
  CALENDAR = 'CALENDAR',
  PROJECT_CREATION = 'PROJECT_CREATION',
  PROJECT_SELECT = 'PROJECT_SELECT',
  TRANSLATION = 'TRANSLATION',
  SETTINGS = 'SETTINGS',
  CREATE_ITEM = 'CREATE_ITEM',
  GOOGLE_MAP = 'GOOGLE_MAP',
  SCRATCHPAD = 'SCRATCHPAD',
}

export enum ItemType {
  APPLICATION = 'APPLICATION',
  CONFIGURATION = 'CONFIGURATION',
  CUSTOM = 'CUSTOM',
  TEMPORARY_RESULT = 'TEMPORARY_RESULT',
}

export interface Item {
  icon?: string
  iconImage?: ImageURISource | number | ImageURISource[]
  iconComponent?: FC<any>
  color?: string
  url?: string
  preventClose?: boolean
  type: ItemType
  name: string
  callback?: () => void
  isApplescript?: boolean
  text?: string
  shortcut?: string
  isFavorite?: boolean // injected in UI array
}

type OnboardingStep =
  | 'v1_start'
  | 'v1_shortcut'
  | 'v1_quick_actions'
  | 'v1_skipped'
  | 'v1_completed'

export let createUIStore = (root: IRootStore) => {
  const persist = async () => {
    const plainState = toJS(store)

    AsyncStorage.setItem('@ui.store', JSON.stringify(plainState))
  }

  let hydrate = async () => {
    const storeState = await AsyncStorage.getItem('@ui.store')

    if (storeState) {
      let parsedStore = JSON.parse(storeState)

      runInAction(() => {
        store.frequencies = parsedStore.frequencies
        store.projects = parsedStore.projects
        store.currentlyTrackedProjectId = parsedStore.currentlyTrackedProjectId
        store.weatherApiKey = parsedStore.weatherApiKey
        store.weatherLat = parsedStore.weatherLat
        store.weatherLon = parsedStore.weatherLon
        store.onboardingStep = parsedStore.onboardingStep
        store.launchAtLogin = parsedStore.launchAtLogin
        store.firstTranslationLanguage =
          parsedStore.firstTranslationLanguage ?? 'en'
        store.secondTranslationLanguage =
          parsedStore.secondTranslationLanguage ?? 'de'
        store.customItems = parsedStore.customItems ?? []
        store.favorites = parsedStore.favorites ?? []
        if (
          store.onboardingStep !== 'v1_completed' &&
          store.onboardingStep !== 'v1_skipped'
        ) {
          store.focusedWidget = FocusableWidget.ONBOARDING
        }
        store.notes = parsedStore.notes ?? ['']
      })
    } else {
      runInAction(() => {
        store.focusedWidget = FocusableWidget.ONBOARDING
      })
    }
  }

  const SETTING_ITEMS: Item[] =
    Platform.select({
      macos: [
        {
          icon: '⏰',
          name: 'Track time',
          type: ItemType.CONFIGURATION,
          preventClose: true,
          callback: () => {
            store.focusWidget(FocusableWidget.PROJECT_SELECT)
          },
        },
        {
          icon: '✋',
          name: 'Stop Tracking Time',
          type: ItemType.CONFIGURATION,
          preventClose: true,
          callback: () => {
            store.stopTrackingProject()
          },
        },
        {
          icon: '➕',
          name: 'Create Tracking Project',
          type: ItemType.CONFIGURATION,
          preventClose: true,
          callback: () => {
            store.showProjectCreationForm()
          },
        },
        {
          iconImage: Assets.DarkModeIcon,
          name: 'Dark mode',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.toggleDarkMode()
          },
        },
        {
          iconImage: Assets.SleepIcon,
          name: 'Sleep',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.executeAppleScript('tell application "Finder" to sleep')
          },
        },
        {
          iconImage: Assets.Airdrop,
          name: 'AirDrop',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.executeAppleScript(`tell application "Finder"
          if exists window "AirDrop" then
                  tell application "System Events" to ¬
                          tell application process "Finder" to ¬
                                  perform action "AXRaise" of ¬
                                          (windows whose title is "AirDrop")
          else if (count Finder windows) > 0 then
                  make new Finder window
                  tell application "System Events" to ¬
                          click menu item "AirDrop" of menu 1 of menu bar item ¬
                                  "Go" of menu bar 1 of application process "Finder"
          else
                  tell application "System Events" to ¬
                          click menu item "AirDrop" of menu 1 of menu bar item ¬
                                  "Go" of menu bar 1 of application process "Finder"
          end if
          activate
        end tell`)
          },
        },
        {
          iconImage: Assets.LockIcon,
          name: 'Lock',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.executeAppleScript(
              `tell application "System Events" to keystroke "q" using {control down, command down}`,
            )
          },
        },
        {
          iconComponent: () => {
            const colorScheme = Appearance.getColorScheme()

            return (
              <Image
                source={Assets.SolWhiteSmall}
                style={tw.style('w-4 h-4', {
                  tintColor: colorScheme === 'dark' ? 'white' : 'black',
                })}
              />
            )
          },
          name: 'Settings',
          type: ItemType.CONFIGURATION,
          callback: () => {
            store.focusWidget(FocusableWidget.SETTINGS)
          },
          preventClose: true,
        },
        {
          icon: '✳️',
          name: 'Create shortcut',
          type: ItemType.CONFIGURATION,
          callback: () => {
            store.focusWidget(FocusableWidget.CREATE_ITEM)
          },
          preventClose: true,
        },
        {
          iconComponent: () => {
            return (
              <View style={tw`w-4 h-4 p-[2] rounded items-end bg-black`}>
                <View style={tw`w-1 h-3 p-1 rounded-sm bg-white`} />
              </View>
            )
          },
          name: 'Resize window to right-half',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.resizeFrontmostRightHalf()
          },
          shortcut: '^ ⌥ →',
        },
        {
          iconComponent: () => {
            return (
              <View style={tw`w-4 h-4 p-[2] rounded items-start bg-black`}>
                <View style={tw`w-1 h-3 p-1 rounded-sm bg-white`} />
              </View>
            )
          },
          name: 'Resize window to left-half',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.resizeFrontmostLeftHalf()
          },
          shortcut: '^ ⌥ ←',
        },
        {
          iconComponent: () => {
            return (
              <View style={tw`w-4 h-4 p-[2] rounded items-start bg-black`}>
                <View style={tw`w-3  h-3 p-1 rounded-sm bg-white`} />
              </View>
            )
          },
          name: 'Resize window to full-screen',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.resizeFrontmostFullscreen()
          },
          shortcut: '^ ⌥ ↩',
        },
        {
          iconComponent: () => {
            return (
              <View
                style={tw`w-4 h-4 rounded items-center justify-center bg-black`}>
                <Text style={tw`text-white`}>→</Text>
              </View>
            )
          },
          name: 'Move window to next screen',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.moveFrontmostNextScreen()
          },
          shortcut: '^ ⌥ ⌘ →',
        },
        {
          iconComponent: () => {
            return (
              <View
                style={tw`w-4 h-4 rounded items-center justify-center bg-black`}>
                <Text style={tw`text-white`}>←</Text>
              </View>
            )
          },
          name: 'Resize window to previous screen',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.moveFrontmostPrevScreen()
          },
          shortcut: '^ ⌥ ⌘ ←',
        },
        {
          icon: '🖊',
          name: 'Scratchpad',
          preventClose: true,
          type: ItemType.CONFIGURATION,
          callback: () => {
            store.focusWidget(FocusableWidget.SCRATCHPAD)
          },
          shortcut: '⌘ + ⇧ + Space',
        },
        ...buildSystemPreferencesItems(),
      ],
      windows: [
        {
          iconImage: Assets.DarkModeIcon,
          name: 'Dark mode',
          type: ItemType.CONFIGURATION,
          callback: () => {
            solNative.toggleDarkMode()
          },
        },
      ],
    }) || []

  if (__DEV__) {
    SETTING_ITEMS.push({
      icon: '🐣',
      name: '[DEV] Restart onboarding',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.onboardingStep = 'v1_start'
        store.focusWidget(FocusableWidget.ONBOARDING)
      },
      preventClose: true,
    })

    SETTING_ITEMS.push({
      icon: '💥',
      name: '[DEV] Reload',
      type: ItemType.CONFIGURATION,
      callback: () => {
        DevSettings.reload()
      },
      preventClose: true,
    })

    SETTING_ITEMS.push({
      icon: '🧨',
      name: 'Sentry Crash',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Sentry.captureMessage('Hello sentry')
        // Sentry.nativeCrash()
      },
    })
  }

  let store = makeAutoObservable({
    //    ____  _                              _     _
    //   / __ \| |                            | |   | |
    //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
    //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
    //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
    //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
    notes: [''] as string[],
    isAccessibilityTrusted: false,
    calendarAuthorizationStatus: 'notDetermined' as CalendarAuthorizationStatus,
    onboardingStep: 'v1_start' as OnboardingStep,
    globalShortcut: 'option' as 'command' | 'option',
    now: DateTime.now() as DateTime,
    query: '' as string,
    selectedIndex: 0 as number,
    focusedWidget: FocusableWidget.SEARCH as FocusableWidget,
    events: [] as INativeEvent[],
    currentTemp: 0 as number,
    nextHourForecast: null as null | string,
    customItems: [] as Item[],
    apps: [] as Item[],
    favorites: [] as string[],
    isLoading: false as boolean,
    translationResults: null as null | {
      en: string | undefined
      de: string | undefined
    },
    frequencies: {} as Record<string, number>,
    temporaryResult: null as string | null,
    track: null as
      | {title: string; artist: string; artwork: string}
      | null
      | undefined,
    commandPressed: false as boolean,
    projects: [] as ITrackingProject[],
    tempProjectName: '' as string,
    currentlyTrackedProjectId: null as string | null,
    weatherApiKey: '' as string,
    weatherLat: '' as string,
    weatherLon: '' as string,
    launchAtLogin: false as boolean,
    firstTranslationLanguage: 'en' as string,
    secondTranslationLanguage: 'de' as string,
    //    _____                            _           _
    //   / ____|                          | |         | |
    //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
    //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
    //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
    //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
    //                        | |
    //                        |_|
    get favoriteItems(): Item[] {
      const items = [...store.apps, ...SETTING_ITEMS, ...store.customItems]
      const favorites = store.favorites
        .map(favName => items.find(i => i.name === favName)!)
        .filter(i => i)

      return favorites
    },
    get currentlyTrackedProject(): {
      project: ITrackingProject
      todayTime: number
    } | null {
      const project = store.projects.find(
        p => p.id === store.currentlyTrackedProjectId,
      )
      if (!project) {
        return null
      }
      const todayStartMillis = DateTime.now().startOf('day').valueOf()
      const todayTime = project.periods.reduce((acc, p) => {
        const lStart = DateTime.fromMillis(p.start)
        const lEnd = p.end ? DateTime.fromMillis(p.end) : store.now

        if (lStart.startOf('day').valueOf() === todayStartMillis) {
          acc += lEnd.diff(lStart, 'minutes').minutes
        }

        return acc
      }, 0)

      return {
        project,
        todayTime: Math.floor(todayTime),
      }
    },
    get items(): Item[] {
      const allItems = [...store.apps, ...SETTING_ITEMS, ...store.customItems]

      if (store.query) {
        let results = new Fuse(allItems, {
          ...FUSE_OPTIONS,
          sortFn: (a: any, b: any) => {
            const freqA = store.frequencies[a.item[0].v] ?? 0
            const freqB = store.frequencies[b.item[0].v] ?? 0
            return freqB - freqA
          },
        })
          .search(store.query)
          .map(r => r.item)

        const fallbackItems: Item[] = [
          {
            iconImage: Assets.googleLogo,
            name: 'Google Search',
            type: ItemType.CONFIGURATION,
            shortcut: '⌘ 1',
            callback: () => {
              Linking.openURL(
                `https://google.com/search?q=${encodeURIComponent(
                  store.query,
                )}`,
              )
            },
          },
          {
            iconImage: Assets.googleTranslateLogo,
            name: 'Google Translate',
            type: ItemType.CONFIGURATION,
            callback: () => {
              store.translateQuery()
            },
            shortcut: '⌘ 2',
            preventClose: true,
          },
          {
            iconImage: Assets.GoogleMaps,
            name: 'Google Maps Search',
            type: ItemType.CONFIGURATION,
            callback: () => {
              store.focusedWidget = FocusableWidget.GOOGLE_MAP
            },
            shortcut: '⌘ 3',
            preventClose: true,
          },
        ]

        // Return the fallback if we have a temporary result or no results
        const shouldReturnFallback =
          results.length === 0 || !!store.temporaryResult

        const temporaryResultItems = !!store.temporaryResult
          ? [{type: ItemType.TEMPORARY_RESULT, name: ''}]
          : []

        if (CONSTANTS.LESS_VALID_URL.test(store.query)) {
          fallbackItems.unshift({
            type: ItemType.CONFIGURATION,
            name: 'Open Url',
            icon: '🌎',
            callback: () => {
              if (store.query.startsWith('https://')) {
                Linking.openURL(store.query)
              } else {
                Linking.openURL(`http://${store.query}`)
              }
            },
          })
        }

        return [
          ...temporaryResultItems,
          ...results,
          ...(shouldReturnFallback ? fallbackItems : []),
        ]
      } else {
        let items = allItems.sort((a, b) => {
          const aIsFavorite = !!store.favorites.includes(a.name)
          const bIsFavorite = !!store.favorites.includes(b.name)

          if (aIsFavorite && !bIsFavorite) {
            return -1
          } else if (!aIsFavorite && bIsFavorite) {
            return 1
          } else if (aIsFavorite && bIsFavorite) {
            return (
              store.favorites.findIndex(v => v === a.name) -
              store.favorites.findIndex(v => v === b.name)
            )
          }

          const freqA = store.frequencies[a.name] ?? 0
          const freqB = store.frequencies[b.name] ?? 0
          return freqB - freqA
        })

        // Add extra props to favorites
        items = produce(items, draft => {
          store.favorites.forEach((_, index) => {
            draft[index].isFavorite = true
          })
        })

        return items
      }
    },
    //                _   _
    //      /\       | | (_)
    //     /  \   ___| |_ _  ___  _ __  ___
    //    / /\ \ / __| __| |/ _ \| '_ \/ __|
    //   / ____ \ (__| |_| | (_) | | | \__ \
    //  /_/    \_\___|\__|_|\___/|_| |_|___/
    removeNote: (idx: number) => {
      store.notes = store.notes.filter((_, index) => index !== idx)
    },
    setSelectedIndex: (idx: number) => {
      store.selectedIndex = idx
    },
    updateNote: (idx: number, note: string) => {
      store.notes[idx] = note
    },
    fetchEvents: () => {
      if (
        store.calendarAuthorizationStatus ===
        CalendarAuthorizationStatus.authorized
      ) {
        if (__DEV__) {
          store.events = [
            {
              color: 'orange',
              date: DateTime.now().toISO(),
              endDate: DateTime.now().plus({hour: 1}).toISO(),
              isAllDay: false,
              location: '',
              notes: '',
              status: 0,
              title: 'Very important meeting',
            },
            {
              color: 'orange',
              date: DateTime.now().toISO(),
              endDate: DateTime.now().plus({hour: 2}).toISO(),
              isAllDay: false,
              location: '',
              notes: '',
              status: 1,
              title: 'Not so important meeting',
            },
            {
              color: 'cyan',
              date: DateTime.now().plus({day: 1}).toISO(),
              endDate: DateTime.now().plus({hour: 2, day: 1}).toISO(),
              isAllDay: false,
              location: '',
              notes: '',
              status: 0,
              title: 'Call insurance',
            },
          ]
          return
        }

        solNative
          .getNextEvents(store.query)
          .then(events => {
            console.warn('events', events)

            runInAction(() => {
              store.events = events
            })
          })
          .catch(e => {
            console.warn('Error getting events', e)
          })
      }
    },
    toggleFavorite: (item: Item) => {
      if (store.favorites.includes(item.name)) {
        store.favorites = store.favorites.filter(v => v !== item.name)
      } else {
        if (store.favorites.length === 5) {
          Alert.alert('Only 5 favorite items allowed.')
          return
        }
        store.setQuery('')
        store.favorites.push(item.name)
      }
    },
    createCustomItem: (item: Item) => {
      store.customItems.push(item)
    },
    translateQuery: async () => {
      store.isLoading = true
      try {
        const translations = await doubleTranslate(
          store.firstTranslationLanguage,
          store.secondTranslationLanguage,
          store.query,
        )
        runInAction(() => {
          store.focusedWidget = FocusableWidget.TRANSLATION
          store.translationResults = translations
          store.selectedIndex = 0
        })
      } catch (e) {
      } finally {
        runInAction(() => {
          store.isLoading = false
        })
      }
    },
    setFirstTranslationLanguage: (l: string) => {
      store.firstTranslationLanguage = l
    },
    setSecondTranslationLanguage: (l: string) => {
      store.secondTranslationLanguage = l
    },
    setLaunchAtLogin: (launchAtLogin: boolean) => {
      store.launchAtLogin = launchAtLogin
      solNative.setLaunchAtLogin(launchAtLogin)
    },
    setOnboardingStep: (step: OnboardingStep) => {
      store.onboardingStep = step
    },
    setGlobalShortcut: (key: 'command' | 'option') => {
      solNative.setGlobalShortcut(key)
      store.globalShortcut = key
    },
    setWeatherLat: (lat: string) => {
      store.weatherLat = lat
    },
    setWeatherLon: (lon: string) => {
      store.weatherLon = lon
    },
    setWeatherApiKey: (key: string) => {
      store.weatherApiKey = key
    },
    trackProject: (id: string) => {
      // Stop tracking previous project
      if (store.currentlyTrackedProjectId) {
        store.stopTrackingProject()
      }

      store.currentlyTrackedProjectId = id
      const foundIndex = store.projects.findIndex(p => p.id === id)
      if (foundIndex >= 0) {
        const now = DateTime.now()
        store.now = now
        store.projects[foundIndex].periods.push({
          id: now.toMillis(),
          start: now.toMillis(),
        })
      }
      store.query = ''
    },
    stopTrackingProject: () => {
      const foundIndex = store.projects.findIndex(
        p => p.id === store.currentlyTrackedProjectId,
      )
      if (foundIndex >= 0) {
        store.projects[foundIndex].periods[
          store.projects[foundIndex].periods.length - 1
        ].end = DateTime.now().toMillis()
        store.currentlyTrackedProjectId = null
      }
      store.query = ''
    },
    setTempProjectName: (name: string) => {
      store.tempProjectName = name
    },
    focusWidget: (widget: FocusableWidget) => {
      store.selectedIndex = 0
      store.focusedWidget = widget
    },
    createTrackingProject: () => {
      store.projects.push({
        id: new Date().getMilliseconds().toString(),
        name: store.tempProjectName,
        periods: [],
      })
      store.focusedWidget = FocusableWidget.PROJECT_SELECT
      store.selectedIndex = 0
      store.tempProjectName = ''
    },
    showProjectCreationForm: () => {
      store.focusedWidget = FocusableWidget.PROJECT_CREATION
    },
    setFocus: (widget: FocusableWidget) => {
      store.focusedWidget = widget
    },
    setQuery: (query: string) => {
      store.focusedWidget = FocusableWidget.SEARCH
      store.query = query
      store.selectedIndex = 0

      try {
        const res = exprParser.evaluate(store.query)
        if (res) {
          store.temporaryResult = res.toString()
        } else {
          store.temporaryResult = null
        }
      } catch (e) {
        store.temporaryResult = null
      }

      store.fetchEvents()
    },
    runFavorite: (index: number) => {
      const item = store.favoriteItems[index]

      if (!!item && item.type === ItemType.CUSTOM) {
        if (item.text) {
          if (item.isApplescript) {
            solNative.executeAppleScript(item.text)
          } else {
            Linking.openURL(item.text)
          }
        }
      }

      solNative.hideWindow()
    },
    keyDown: async ({
      keyCode,
      meta,
      shift,
    }: {
      key: string
      keyCode: number
      meta: boolean
      shift: boolean
    }) => {
      // esc = "\u{1B}" or 53
      // arrow up = "" or 126
      // arrow down = "" or 125
      // tab = "\t" or 48
      // enter = "\r" or 36
      // command = "command" or 55
      // console.warn('key pressed', keyCode)

      switch (keyCode) {
        // tab key
        case 48: {
          let nextWidget = store.focusedWidget

          switch (store.focusedWidget) {
            case FocusableWidget.SEARCH:
              if (!!store.events.length) {
                if (store.events[0].isAllDay) {
                  store.selectedIndex = 1
                } else {
                  store.selectedIndex = 0
                }
                nextWidget = FocusableWidget.CALENDAR
              }
              break

            case FocusableWidget.CALENDAR:
              store.selectedIndex = 0
              nextWidget = FocusableWidget.SEARCH
              break

            case FocusableWidget.SCRATCHPAD:
              if (shift) {
                store.selectedIndex =
                  store.selectedIndex - 1 < 0
                    ? store.notes.length - 1
                    : store.selectedIndex - 1
              } else {
                store.selectedIndex =
                  (store.selectedIndex + 1) % store.notes.length
              }
              return
          }

          store.focusedWidget = nextWidget

          break
        }

        // Enter key
        case 36: {
          switch (store.focusedWidget) {
            case FocusableWidget.SCRATCHPAD: {
              if (shift) {
                store.notes.unshift('')
                store.selectedIndex = 0
                return
              }

              if (meta) {
                Clipboard.setString(store.notes[store.selectedIndex])
                store.removeNote(store.selectedIndex)
                if (store.selectedIndex === 0) {
                  store.notes.unshift('')
                }
              } else {
                store.updateNote(
                  store.selectedIndex,
                  store.notes[store.selectedIndex] + '\n',
                )
              }
            }

            case FocusableWidget.ONBOARDING: {
              switch (store.onboardingStep) {
                case 'v1_start': {
                  store.onboardingStep = 'v1_shortcut'
                  break
                }

                case 'v1_shortcut': {
                  if (store.selectedIndex === 0) {
                    store.setGlobalShortcut('option')
                  } else {
                    store.setGlobalShortcut('command')
                  }
                  store.onboardingStep = 'v1_quick_actions'
                  break
                }

                case 'v1_quick_actions': {
                  store.onboardingStep = 'v1_completed'
                  break
                }
              }
              break
            }

            case FocusableWidget.PROJECT_CREATION: {
              store.createTrackingProject()
              break
            }

            case FocusableWidget.PROJECT_SELECT: {
              const id = store.projects[store.selectedIndex].id
              store.trackProject(id)
              store.focusedWidget = FocusableWidget.SEARCH
              store.selectedIndex = 0
              break
            }

            case FocusableWidget.CALENDAR: {
              const event = store.events[store.selectedIndex]
              if (event) {
                let eventLink = event.url
                if (!eventLink && event.notes) {
                  eventLink = extractMeetingLink(event.notes)
                }
                if (eventLink) {
                  Linking.openURL(eventLink)
                } else {
                  Linking.openURL('ical://')
                }
              } else {
                Linking.openURL('ical://')
              }
              solNative.hideWindow()
              break
            }

            case FocusableWidget.TRANSLATION: {
              if (store.translationResults) {
                if (store.selectedIndex === 0) {
                  Clipboard.setString(store.translationResults.en!)
                } else {
                  Clipboard.setString(store.translationResults.de!)
                }
                solNative.hideWindow()
                store.translationResults = null
              }
              break
            }

            case FocusableWidget.SEARCH: {
              if (store.temporaryResult && store.selectedIndex === 0) {
                Clipboard.setString(store.temporaryResult)
                solNative.hideWindow()
                return
              }

              let item = store.items[store.selectedIndex]

              // bump frequency
              store.frequencies[item.name] =
                (store.frequencies[item.name] ?? 0) + 1

              // close window
              if (!item.preventClose) {
                solNative.hideWindow()
              }

              if (item.url) {
                solNative.openFile(item.url)
              } else if (item.callback) {
                item.callback()
              }

              if (item.type === ItemType.CUSTOM) {
                if (item.text) {
                  if (item.isApplescript) {
                    solNative.executeAppleScript(item.text)
                  } else {
                    Linking.openURL(item.text)
                  }
                }
              }

              break
            }
          }

          break
        }

        // esc key
        case 53: {
          if (store.focusedWidget === FocusableWidget.SEARCH) {
            solNative.hideWindow()
            return
          }

          store.setQuery('')

          break
        }

        // up key
        case 126: {
          store.selectedIndex = Math.max(0, store.selectedIndex - 1)
          break
        }

        // down key
        case 125: {
          switch (store.focusedWidget) {
            case FocusableWidget.ONBOARDING: {
              switch (store.onboardingStep) {
                case 'v1_shortcut': {
                  store.selectedIndex = Math.min(1, store.selectedIndex + 1)
                }
              }
              break
            }

            case FocusableWidget.SEARCH: {
              store.selectedIndex = Math.min(
                store.items.length - 1,
                store.selectedIndex + 1,
              )
              break
            }

            case FocusableWidget.CALENDAR: {
              store.selectedIndex = Math.min(2, store.selectedIndex + 1)
              break
            }

            case FocusableWidget.PROJECT_SELECT: {
              store.selectedIndex =
                (store.selectedIndex + 1) % store.projects.length
              break
            }

            case FocusableWidget.TRANSLATION: {
              store.selectedIndex = (store.selectedIndex + 1) % 2
              break
            }
          }
          break
        }

        // "1"
        case 18: {
          if (meta) {
            if (store.query) {
              Linking.openURL(`https://google.com/search?q=${store.query}`)
              store.query = ''
            } else {
              store.runFavorite(0)
            }
          }
          break
        }

        // "2"
        case 19: {
          if (meta) {
            if (store.query) {
              store.translateQuery()
            } else {
              store.runFavorite(1)
            }
          }
          break
        }

        // "3"
        case 20: {
          if (meta) {
            if (store.query) {
              store.focusedWidget = FocusableWidget.GOOGLE_MAP
            } else {
              store.runFavorite(2)
            }
          }
          break
        }

        // "4"
        case 21: {
          if (meta) {
            store.runFavorite(3)
          }
          break
        }

        // "5"
        case 23: {
          if (meta) {
            store.runFavorite(4)
          }
          break
        }

        case 55: {
          store.commandPressed = true
          break
        }
      }
    },
    keyUp: async ({
      keyCode,
      meta,
    }: {
      key: string
      keyCode: number
      meta: boolean
    }) => {
      switch (keyCode) {
        case 55:
          store.commandPressed = false
          break

        default:
          break
      }
    },
    onShow: () => {
      runInAction(() => {
        store.now = DateTime.now()
      })

      store.fetchEvents()

      if (store.weatherApiKey) {
        getWeather(
          store.weatherApiKey,
          store.weatherLat,
          store.weatherLon,
        ).then(res => {
          runInAction(() => {
            store.currentTemp = res?.temp ? Math.round(res.temp) : 0
            store.nextHourForecast = res?.nextHourForecast ?? null
          })
        })
      }

      if (!store.isAccessibilityTrusted) {
        store.checkAccessibilityStatus()
      }

      solNative.getMediaInfo().then(res => {
        runInAction(() => {
          store.track = res
        })
      })

      solNative.getApps().then(apps => {
        // Each "app" is a macOS file url, e.g. file:///Applications/SF%20Symbols
        const cleanApps = apps.map(url => {
          const pureUrl = decodeURI(url.replace('file://', ''))
          const tokens = pureUrl.split('/')
          return {
            type: ItemType.APPLICATION as ItemType.APPLICATION,
            url: pureUrl,
            name: tokens[tokens.length - 2].replace('.app', ''),
          }
        })

        runInAction(() => {
          store.apps = cleanApps
        })
      })
    },
    onHide: () => {
      store.focusedWidget = FocusableWidget.SEARCH
      store.setQuery('')
      store.selectedIndex = 0
      store.translationResults = null
    },
    resetUI: () => {
      store.focusedWidget = FocusableWidget.SEARCH
      store.setQuery('')
      store.selectedIndex = 0
      store.translationResults = null
    },
    cleanUp: () => {
      keyDownListener?.remove()
      keyUpListener?.remove()
      onShowListener?.remove()
      onHideListener?.remove()
      showScratchPadListener?.remove()
    },
    checkCalendarAccess: () => {
      solNative
        .getCalendarAuthorizationStatus()
        .then(calendarAuthorizationStatus => {
          runInAction(() => {
            store.calendarAuthorizationStatus = calendarAuthorizationStatus
          })
        })
    },
    checkAccessibilityStatus: () => {
      solNative.getAccessibilityStatus().then(v => {
        runInAction(() => {
          store.isAccessibilityTrusted = v
        })
      })
    },
    showScratchpad: () => {
      store.focusWidget(FocusableWidget.SCRATCHPAD)
    },
  })

  hydrate().then(() => {
    autorun(persist)
    solNative.setGlobalShortcut(store.globalShortcut)
    store.checkCalendarAccess()
    store.checkAccessibilityStatus()
  })

  keyDownListener = solNative.addListener('keyDown', store.keyDown)
  keyUpListener = solNative.addListener('keyUp', store.keyUp)
  onShowListener = solNative.addListener('onShow', store.onShow)
  onHideListener = solNative.addListener('onHide', store.onHide)
  showScratchPadListener = solNative.addListener(
    'showScratchpad',
    store.showScratchpad,
  )

  return store
}
