import {Assets} from 'assets'
import {Parser} from 'expr-eval'
import Fuse from 'fuse.js'
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
import React, {ReactNode} from 'react'
import {
  Alert,
  Appearance,
  AsyncStorage,
  Clipboard,
  EmitterSubscription,
  Image,
  ImageURISource,
  Linking,
  NativeModules,
} from 'react-native'
import {IRootStore} from 'Store'
import tw from 'tailwind'
import {buildSystemPreferencesItems} from './systemPreferences'

let keyDownListener: EmitterSubscription | undefined
let keyUpListener: EmitterSubscription | undefined
let onShowListener: EmitterSubscription | undefined
let onHideListener: EmitterSubscription | undefined

const exprParser = new Parser()

const FUSE_OPTIONS = {
  threshold: 0.2,
  ignoreLocation: true,
  keys: ['name'],
}

const MEETING_PROVIDERS_URLS = [
  'https://us01web.zoom.us',
  'https://us02web.zoom.us',
  'https://us03web.zoom.us',
  'https://us04web.zoom.us',
  'https://us05web.zoom.us',
  'https://us06web.zoom.us',
  'https://meet.google.com',
  'https://meet.ffmuc.net',
  'https://teams.microsoft.com',
]

export enum FocusableWidget {
  ONBOARDING = 'ONBOARDING',
  SEARCH = 'SEARCH',
  CALENDAR = 'CALENDAR',
  PROJECT_CREATION = 'PROJECT_CREATION',
  PROJECT_SELECT = 'PROJECT_SELECT',
  TRANSLATION = 'TRANSLATION',
  SETTINGS = 'SETTINGS',
  CREATE_ITEM = 'CREATE_ITEM',
}

export enum ItemType {
  APPLICATION = 'APPLICATION',
  CONFIGURATION = 'CONFIGURATION',
  CUSTOM = 'CUSTOM',
  TEMPORARY_RESULT = 'TEMPORARY_RESULT',
}

interface IApp {
  url: string
  type: ItemType.APPLICATION
  name: string
}

interface ICustomItem {
  name: string
  icon: string
  color: string
  text: string
  type: ItemType.CUSTOM
  isApplescript: boolean
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

interface IItem {
  icon?: string
  iconImage?: ImageURISource | number | ImageURISource[]
  iconComponent?: ReactNode
  url?: string
  preventClose?: boolean
  type: ItemType
  name: string
  callback?: () => void
  isApplescript?: boolean
  text?: string
}

function extractLinkFromDescription(text?: string, location?: string) {
  let link = text
    ?.replace(/\n/g, ' ')
    .split(' ')
    .filter(token => CONSTANTS.REGEX_VALID_URL.test(token))
    .find(link =>
      MEETING_PROVIDERS_URLS.some(baseUrl => link.includes(baseUrl)),
    )

  if (!link && !!location) {
    const isLocationUrl = CONSTANTS.REGEX_VALID_URL.test(location)
    if (isLocationUrl) {
      link = location
    }
  }

  return link
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
      })
    } else {
      runInAction(() => {
        store.focusedWidget = FocusableWidget.ONBOARDING
      })
    }
  }

  const SETTING_ITEMS: IItem[] = [
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
    ...buildSystemPreferencesItems(),
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
  ]

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
        NativeModules.DevMenu.reload()
      },
      preventClose: true,
    })
  }

  let store = makeAutoObservable({
    //    ____  _                              _     _
    //   / __ \| |                            | |   | |
    //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
    //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
    //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
    //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
    calendarAuthorizationStatus: 'notDetermined' as CalendarAuthorizationStatus,
    onboardingStep: 'v1_start' as OnboardingStep,
    globalShorcut: 'command' as 'command' | 'option',
    now: DateTime.now() as DateTime,
    query: '' as string,
    selectedIndex: 0 as number,
    focusedWidget: FocusableWidget.SEARCH as FocusableWidget,
    events: [] as INativeEvent[],
    currentTemp: 0 as number,
    nextHourForecast: null as null | string,
    customItems: [] as ICustomItem[],
    apps: [] as IApp[],
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
    get favoriteItems(): (IApp | ICustomItem)[] {
      const items = [...store.apps, ...SETTING_ITEMS, ...store.customItems]
      const favorites = store.favorites
        .map(favName => items.find(i => i.name === favName))
        .filter(i => i)

      // @ts-ignore
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
    get items(): IItem[] {
      if (store.query) {
        let results = new Fuse(
          [...store.apps, ...SETTING_ITEMS, ...store.customItems],
          {
            ...FUSE_OPTIONS,
            sortFn: (a: any, b: any) => {
              const freqA = store.frequencies[a.item[0].v] ?? 0
              const freqB = store.frequencies[b.item[0].v] ?? 0
              return freqB - freqA
            },
          },
        )
          .search(store.query)
          .map(r => r.item)

        const fallbackItems = [
          {
            iconImage: Assets.googleLogo,
            name: 'Google Search',
            type: ItemType.CONFIGURATION,
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
            preventClose: true,
          },
        ]

        // Return the fallback if we have a temporary result or no results
        const shouldReturnFallback =
          results.length === 0 || !!store.temporaryResult

        const temporaryResultItems = !!store.temporaryResult
          ? [{type: ItemType.TEMPORARY_RESULT, name: ''}]
          : []

        return [
          ...temporaryResultItems,
          ...results,
          ...(shouldReturnFallback ? fallbackItems : []),
        ]
      } else {
        return [...store.apps, ...SETTING_ITEMS, ...store.customItems]
          .filter(i => !store.favorites.includes(i.name))
          .sort((a, b) => {
            const freqA = store.frequencies[a.name] ?? 0
            const freqB = store.frequencies[b.name] ?? 0
            return freqB - freqA
          })
      }
    },
    //                _   _
    //      /\       | | (_)
    //     /  \   ___| |_ _  ___  _ __  ___
    //    / /\ \ / __| __| |/ _ \| '_ \/ __|
    //   / ____ \ (__| |_| | (_) | | | \__ \
    //  /_/    \_\___|\__|_|\___/|_| |_|___/
    toggleFavorite: (item: ICustomItem | IApp) => {
      if (store.favorites.includes(item.name)) {
        store.favorites = store.favorites.filter(v => v === item.name)
      } else {
        if (store.favorites.length === 5) {
          Alert.alert('Only 5 favorite items allowed.')
          return
        }
        store.favorites.push(item.name)
      }
    },
    createCustomItem: (item: ICustomItem) => {
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
      store.globalShorcut = key
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

      solNative.getNextEvents(query).then(events => {
        events = events.filter(
          v =>
            v.title?.toLowerCase().includes(store.query.toLowerCase()) ??
            v.notes?.toLowerCase().includes(store.query.toLowerCase()) ??
            false,
        )

        runInAction(() => {
          store.events = events
        })
      })
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
    }: {
      key: string
      keyCode: number
      meta: boolean
    }) => {
      // esc = "\u{1B}" or 53
      // arrow up = "" or 126
      // arrow down = "" or 125
      // tab = "\t" or 48
      // enter = "\r" or 36
      // command = "command" or 55
      // console.warn('key pressed', keyCode)

      switch (keyCode) {
        // tab
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
          }

          store.focusedWidget = nextWidget

          break
        }

        // Enter key
        case 36: {
          switch (store.focusedWidget) {
            case FocusableWidget.ONBOARDING: {
              switch (store.onboardingStep) {
                case 'v1_start': {
                  store.onboardingStep = 'v1_shortcut'
                  break
                }

                case 'v1_shortcut': {
                  if (store.selectedIndex === 0) {
                    store.setGlobalShortcut('command')
                  } else {
                    store.setGlobalShortcut('option')
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
                  eventLink = extractLinkFromDescription(event.notes)
                }
                if (eventLink) {
                  Linking.openURL(eventLink)
                } else {
                  Linking.openURL('ical://')
                }
              } else {
                Linking.openURL('ical://')
              }
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
              if (!store.query) {
                if (store.selectedIndex < store.favorites.length) {
                  item = store.favoriteItems[store.selectedIndex]
                } else {
                  item =
                    store.items[store.selectedIndex - store.favorites.length]
                }
              }

              // bump frequency
              store.frequencies[item.name] = store.frequencies[item.name]
                ? store.frequencies[item.name] + 1
                : 1

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
              store.translateQuery()
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
              Linking.openURL(`https://google.com/search?q=${store.query}`)
              store.query = ''
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
              Linking.openURL(`https://google.com/search?q=${store.query}`)
              store.query = ''
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

      if (store.calendarAuthorizationStatus === 'notDetermined') {
        solNative.getCalendarAuthorizationStatus().then(authorization => {
          runInAction(() => {
            store.calendarAuthorizationStatus = authorization
          })
        })
      }

      solNative
        .getNextEvents(store.query)
        .then(events => {
          runInAction(() => {
            store.events = events
          })
        })
        .catch(e => {
          console.warn('Error getting events', e)
        })

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

      // solNative.getMediaInfo().then(res => {
      //   runInAction(() => {
      //     store.track = res
      //   })
      // })

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
    },
  })

  hydrate().then(() => {
    autorun(persist)
    solNative.setGlobalShortcut(store.globalShorcut)
  })

  keyDownListener = solNative.addListener('keyDown', store.keyDown)
  keyUpListener = solNative.addListener('keyUp', store.keyUp)
  onShowListener = solNative.addListener('onShow', store.onShow)
  onHideListener = solNative.addListener('onHide', store.onHide)

  return store
}
