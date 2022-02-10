import {makeAutoObservable, runInAction, toJS, autorun} from 'mobx'
import {IRootStore} from 'Store'
import {solNative} from 'lib/SolNative'
import {AsyncStorage, Linking, Clipboard} from 'react-native'
import {CONSTANTS} from 'lib/constants'
import {getCurrentWeather} from 'lib/weather'
import {DateTime} from 'luxon'
import Fuse from 'fuse.js'
import {doubleTranslate} from 'lib/translator'

const FUSE_OPTIONS = {
  threshold: 0.2,
  ignoreLocation: true,
  keys: ['name'],
}

const MEETING_PROVIDERS_URLS = [
  'https://us06web.zoom.us',
  'https://meet.google.com',
  'https://meet.ffmuc.net',
]

export enum FocusableWidget {
  SEARCH = 'SEARCH',
  TODOS = 'TODOS',
  CALENDAR = 'CALENDAR',
  WEATHER = 'WEATHER',
}

export enum ItemType {
  APPLICATION = 'APPLICATION',
  CONFIGURATION = 'CONFIGURATION',
}

interface IApp {
  url: string
  type: ItemType.APPLICATION
  name: string
}

interface IItem {
  icon?: string
  url?: string
  type: ItemType
  name: string
  callback?: () => void
}

interface IEvent {
  title?: string
  url?: string
  date: string
  isAllDay: boolean
  notes?: string
  color: string
  location: string
}

interface ITodo {
  id: string
  text: string
}

function extractLink(text?: string, location?: string) {
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
        store.minimalistMode = parsedStore.minimalistMode
        store.todos = parsedStore.todos
        store.frequencies = parsedStore.frequencies
      })
    }
  }

  const SETTING_ITEMS: IItem[] = [
    {
      icon: '☯️',
      name: 'Turn on minimalism',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.toggleMinimalist()
      },
    },
    {
      icon: '🌓',
      name: 'Toggle dark mode',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.toggleDarkMode()
      },
    },
    {
      icon: '💤',
      name: 'Sleep',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.executeAppleScript('tell application "Finder" to sleep')
      },
    },
  ]

  let store = makeAutoObservable({
    //    ____  _                              _     _
    //   / __ \| |                            | |   | |
    //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
    //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
    //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
    //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
    query: '' as string,
    selectedIndex: 0 as number,
    minimalistMode: false as boolean,
    focusedWidget: FocusableWidget.SEARCH as FocusableWidget,
    events: [] as IEvent[],
    nextEventLink: null as null | string,
    currentTemp: null as null | number,
    nextHourForecast: null as null | string,
    todos: [] as ITodo[],
    apps: [] as IApp[],
    isLoading: false as boolean,
    translationResults: null as null | {
      en: string | undefined
      de: string | undefined
    },
    frequencies: {} as Record<string, number>,
    //    _____                            _           _
    //   / ____|                          | |         | |
    //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
    //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
    //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
    //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
    //                        | |
    //                        |_|
    get items(): IItem[] {
      if (store.query) {
        return new Fuse([...store.apps, ...SETTING_ITEMS], {
          ...FUSE_OPTIONS,
          sortFn: (a: any, b: any) => {
            const freqA = store.frequencies[a.name] ?? 0
            const freqB = store.frequencies[b.name] ?? 0
            return freqB - freqA
          },
        })
          .search(store.query)
          .map(r => r.item)
      } else {
        return [...store.apps, ...SETTING_ITEMS].sort((a, b) => {
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
    toggleMinimalist: () => {
      store.minimalistMode = !store.minimalistMode
    },
    // Actions
    markTodoDone: (idx: number) => {
      if (idx <= store.todos.length) {
        const newTodos = [...store.todos]
        newTodos.splice(idx, 1)

        store.todos = newTodos

        if (
          store.focusedWidget === FocusableWidget.TODOS &&
          store.selectedIndex >= store.todos.length
        ) {
          store.selectedIndex = Math.max(0, store.selectedIndex - 1)
        }
      }
    },
    addTodo: () => {
      store.todos.unshift({
        id: DateTime.now().toString(),
        text: store.query,
      })
      store.query = ''
    },
    setFocus: (widget: FocusableWidget) => {
      store.focusedWidget = widget
    },
    setQuery: (query: string) => {
      store.query = query
      store.selectedIndex = 0
    },
    handleKeyPress: async ({
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
      // console.warn('key pressed', keyCode)

      switch (keyCode) {
        // tab
        case 48: {
          let nextWidget = store.focusedWidget
          switch (store.focusedWidget) {
            case FocusableWidget.SEARCH:
              nextWidget = FocusableWidget.TODOS
              break
            case FocusableWidget.TODOS:
              nextWidget = FocusableWidget.CALENDAR
              break
            case FocusableWidget.CALENDAR:
              nextWidget = FocusableWidget.SEARCH
              break
            // case FocusableWidget.WEATHER:
            //   nextWidget = FocusableWidget.SEARCH
            //   break
          }

          store.selectedIndex = 0
          store.focusedWidget = nextWidget

          break
        }

        // Enter key
        case 36: {
          switch (store.focusedWidget) {
            case FocusableWidget.CALENDAR: {
              if (store.nextEventLink) {
                Linking.openURL(store.nextEventLink)
              } else {
                Linking.openURL('ical://')
              }
              break
            }

            case FocusableWidget.SEARCH: {
              if (store.translationResults) {
                if (store.selectedIndex === 0) {
                  Clipboard.setString(store.translationResults.en!)
                } else {
                  Clipboard.setString(store.translationResults.de!)
                }
                solNative.hideWindow()
                store.translationResults = null
              } else {
                const item = store.items[store.selectedIndex]
                if (item.url) {
                  solNative.openFile(item.url)
                } else if (item.callback) {
                  item.callback()
                }

                // bump frequency
                store.frequencies[item.name] = store.frequencies[item.name]
                  ? store.frequencies[item.name] + 1
                  : 1
                solNative.hideWindow()
              }
              break
            }

            case FocusableWidget.TODOS: {
              store.markTodoDone(store.selectedIndex)
              break
            }
          }

          break
        }

        // escape
        case 53: {
          if (store.query && store.translationResults) {
            store.query = ''
            store.translationResults = null
          } else {
            store.focusedWidget = FocusableWidget.SEARCH
            solNative.hideWindow()
          }
          break
        }

        // arrow up
        case 126: {
          store.selectedIndex = Math.max(0, store.selectedIndex - 1)
          break
        }

        // arrow down
        case 125: {
          if (store.focusedWidget === FocusableWidget.SEARCH) {
            if (store.translationResults) {
              store.selectedIndex = (store.selectedIndex + 1) % 2
            } else {
              store.selectedIndex = Math.min(
                store.items.length - 1,
                store.selectedIndex + 1,
              )
            }
          } else if (store.focusedWidget === FocusableWidget.TODOS) {
            store.selectedIndex = Math.min(
              store.todos.length - 1,
              store.selectedIndex + 1,
            )
          }
          break
        }

        // "1"
        case 18: {
          if (meta) {
            if (store.query) {
              store.isLoading = true
              try {
                const translations = await doubleTranslate(store.query)
                runInAction(() => {
                  store.translationResults = translations
                  store.selectedIndex = 0
                })
              } catch (e) {
              } finally {
                runInAction(() => {
                  store.isLoading = false
                })
              }
            } else {
              Linking.openURL('https://mail.protonmail.com/u/0/inbox')
            }
          }
          break
        }

        // "2"
        case 19: {
          if (meta) {
            if (store.query) {
              store.addTodo()
            } else {
              Linking.openURL('https://github.com/matttti/BodyFast/pulls')
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
              Linking.openURL('https://twitter.com')
            }
          }
          break
        }

        // "4"
        case 21: {
          if (meta) {
            Linking.openURL('vscode://file/Users/osp/Developer/productlane')
          }
          break
        }
      }
    },
    onShow: () => {
      solNative
        .getNextEvents()
        .then(events => {
          runInAction(() => {
            store.events = events

            const filteredEvents = events.filter(e => !e.isAllDay)

            const nextEvent = filteredEvents[0]
            let eventLink = nextEvent?.url
            if (!eventLink) {
              eventLink = extractLink(nextEvent?.notes, nextEvent?.location)
            }

            if (eventLink) {
              store.nextEventLink = eventLink
            }
          })
        })
        .catch(e => {
          console.warn('Error getting events', e)
        })

      getCurrentWeather().then(res => {
        runInAction(() => {
          store.currentTemp = res?.temp ? Math.round(res.temp) : null
          store.nextHourForecast = res?.nextHourForecast ?? null
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
  })

  hydrate().then(() => {
    autorun(persist)
  })

  solNative.addListener('keyDown', store.handleKeyPress)
  solNative.addListener('onShow', store.onShow)
  solNative.addListener('onHide', store.onHide)

  return store
}
