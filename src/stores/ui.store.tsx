import {GiphyFetch} from '@giphy/js-fetch-api'
import * as Sentry from '@sentry/react-native'
import {Assets, Icons} from 'assets'
import {FileIcon} from 'components/FileIcon'
import {FUSE_OPTIONS} from 'config'
import {Parser} from 'expr-eval'
import Fuse from 'fuse.js'
import {extractMeetingLink} from 'lib/calendar'
import {CONSTANTS} from 'lib/constants'
import {allEmojis, emojiFuse, EMOJIS_PER_ROW} from 'lib/emoji'
import {GithubRepo, searchGithubRepos} from 'lib/github'
import {
  CalendarAuthorizationStatus,
  INativeEvent,
  solNative,
} from 'lib/SolNative'
import {doubleTranslate} from 'lib/translator'
import {getWeather} from 'lib/weather'
import {debounce} from 'lodash'
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

const gf = new GiphyFetch('Ot4kWfqWddVroUVh73v4Apocs8Dek86j')
const GIFS_PER_ROW = 5

let keyDownListener: EmitterSubscription | undefined
let keyUpListener: EmitterSubscription | undefined
let onShowListener: EmitterSubscription | undefined
let onHideListener: EmitterSubscription | undefined
let onFileSearchListener: EmitterSubscription | undefined

const exprParser = new Parser()

interface IPeriod {
  id: number
  start: number
  end?: number
}

interface FileDescription {
  filename: string
  path: string
  kind: string
  location: string
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
  EMOJIS = 'EMOJIS',
  GIFS = 'GIFS',
  CLIPBOARD = 'CLIPBOARD',
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
  subName?: string
  callback?: () => void
  metaCallback?: () => void
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

export const createUIStore = (root: IRootStore) => {
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
        if (store.notes.length === 0) {
          store.notes = ['']
        }
        store.globalShortcut = parsedStore.globalShortcut
        store.scratchpadShortcut = parsedStore.scratchpadShortcut ?? 'command'
        store.clipboardManagerShortcut =
          parsedStore.clipboardManagerShortcut ?? 'shift'
        store.frequentlyUsedEmojis = parsedStore.frequentlyUsedEmojis ?? {}
        store.githubSearchEnabled = parsedStore.githubSearchEnabled ?? false
        store.githubToken = parsedStore.githubToken ?? null
        store.showWindowOn = parsedStore.showWindowOn ?? 'screenWithFrontmost'
      })

      solNative.setGlobalShortcut(parsedStore.globalShortcut)
      solNative.setScratchpadShortcut(parsedStore.scratchpadShortcut)
      solNative.setClipboardManagerShortcut(
        parsedStore.clipboardManagerShortcut,
      )
      solNative.setShowWindowOn(
        parsedStore.showWindowOn ?? 'screenWithFrontmost',
      )
    } else {
      runInAction(() => {
        store.focusedWidget = FocusableWidget.ONBOARDING
      })
    }
  }

  const FALLBACK_ITEMS: Item[] = [
    {
      iconImage: Assets.googleLogo,
      name: 'Google Search',
      type: ItemType.CONFIGURATION,
      shortcut: '⌘ 1',
      callback: () => {
        Linking.openURL(
          `https://google.com/search?q=${encodeURIComponent(store.query)}`,
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

  let ITEMS: Item[] = [
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
      icon: '🖥️',
      name: 'Restart Mac',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.executeAppleScript('tell application "Finder" to restart')
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
            <View style={tw`w-1 h-3 p-1 rounded-sm bg-white`} />
          </View>
        )
      },
      name: 'Resize window to top-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostTopHalf()
      },
      shortcut: '^ ⌥ ↑',
    },
    {
      iconComponent: () => {
        return (
          <View style={tw`w-4 h-4 p-[2] rounded items-start bg-black`}>
            <View style={tw`w-1 h-3 p-1 rounded-sm bg-white`} />
          </View>
        )
      },
      name: 'Resize window to bottom-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostBottomHalf()
      },
      shortcut: '^ ⌥ ↓',
    },
    {
      iconComponent: () => {
        return (
          <View style={tw`w-4 h-4 p-[2] rounded items-start bg-black`}>
            <View style={tw`w-1 h-1 p-1 rounded-sm bg-white`} />
          </View>
        )
      },
      name: 'Resize window to top-left',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeTopLeft()
      },
      shortcut: '^ ⌥ U',
    },
    {
      iconComponent: () => {
        return (
          <View style={tw`w-4 h-4 p-[2] rounded items-end bg-black`}>
            <View style={tw`w-1 h-1 p-1 rounded-sm bg-white`} />
          </View>
        )
      },
      name: 'Resize window to top-right',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeTopRight()
      },
      shortcut: '^ ⌥ I',
    },
    {
      iconComponent: () => {
        return (
          <View
            style={tw`w-4 h-4 p-[2] rounded items-start justify-end bg-black`}>
            <View style={tw`w-1 h-1 p-1 rounded-sm bg-white`} />
          </View>
        )
      },
      name: 'Resize window to bottom-left',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeBottomLeft()
      },
      shortcut: '^ ⌥ J',
    },
    {
      iconComponent: () => {
        return (
          <View
            style={tw`w-4 h-4 p-[2] rounded items-end justify-end bg-black`}>
            <View style={tw`w-1 h-1 p-1 rounded-sm bg-white`} />
          </View>
        )
      },
      name: 'Resize window to bottom-right',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeBottomRight()
      },
      shortcut: '^ ⌥ K',
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
      name: 'Move window to previous screen',
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
    {
      icon: '😎',
      name: 'Emoji Picker',
      preventClose: true,
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.showEmojiPicker()
      },
      shortcut: '⌘ + ^ + Space',
    },
    {
      icon: '😂',
      name: 'Search Gif',
      preventClose: true,
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.showGifPicker()
      },
      // shortcut: '⌘ + ^ + Space',
    },
    {
      icon: '🆙',
      name: 'Check for updates',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.checkForUpdates()
      },
    },
    {
      icon: '📋',
      name: 'Clipboard Manager',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.showClipboardManager()
      },
      preventClose: true,
    },
    {
      iconComponent: () => <FileIcon url="~/Downloads" style={tw`w-4 h-4`} />,
      name: 'Downloads',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('~/Downloads')
      },
    },
    {
      iconComponent: () => <FileIcon url="/Applications" style={tw`w-4 h-4`} />,
      name: 'Applications',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('/Applications')
      },
    },
    {
      iconComponent: () => <FileIcon url="~/Pictures" style={tw`w-4 h-4`} />,
      name: 'Pictures',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('~/Pictures')
      },
    },
    {
      iconComponent: () => <FileIcon url="~/Developer" style={tw`w-4 h-4`} />,
      name: 'Developer',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('~/Developer')
      },
    },
    {
      iconComponent: () => <FileIcon url="~/Documents" style={tw`w-4 h-4`} />,
      name: 'Documents',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('~/Documents')
      },
    },
    {
      iconImage: Assets.googleLogo,
      name: 'Start Google Meet',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        await Linking.openURL(`https://meet.google.com/new`)

        solNative.executeAppleScript(`if application "Safari" is running then
          delay 3
          tell application "Safari"
            set myurl to URL of front document as string
          end tell

          if (url is equal to "https://meet.google.com/new") then
            delay 3
            tell application "Safari"
              set myurl to URL of front document as string
            end tell
          else
            set the clipboard to myurl as string
            display notification "Google Meet link copied to clipboard" with title "Link Copied" sound name "Frog"
            return
          end if

          if (url is equal to "https://meet.google.com/new") then
            delay 3
            tell application "Safari"
              set myurl to URL of front document as string
            end tell
          else
            set the clipboard to myurl as string
            display notification "Google Meet link copied to clipboard" with title "Link Copied" sound name "Frog"
            return
          end if

          if (url is equal to "https://meet.google.com/new") then
            delay 3
            tell application "Safari"
              set myurl to URL of front document as string
            end tell
          else
            set the clipboard to myurl as string
            display notification "Google Meet link copied to clipboard" with title "Link Copied" sound name "Frog"
            return
          end if
          
          if (url is equal to "https://meet.google.com/new") then
            display notification "Google Meet could not be copied" with title "Couldn't copy Google Meet link" sound name "Frog"
          else
            set the clipboard to myurl as string
            display notification "Google Meet link copied to clipboard" with title "Link Copied" sound name "Frog"
          end if
        end if
        `)
      },
    },
    ...buildSystemPreferencesItems(),
  ]

  if (Platform.OS === 'windows') {
    ITEMS = [
      {
        iconImage: Assets.DarkModeIcon,
        name: 'Dark mode',
        type: ItemType.CONFIGURATION,
        callback: () => {
          solNative.toggleDarkMode()
        },
      },
    ]
  }

  if (__DEV__) {
    ITEMS.push({
      icon: '🐣',
      name: '[DEV] Restart onboarding',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.onboardingStep = 'v1_start'
        store.focusWidget(FocusableWidget.ONBOARDING)
      },
      preventClose: true,
    })

    ITEMS.push({
      icon: '💥',
      name: '[DEV] Reload',
      type: ItemType.CONFIGURATION,
      callback: () => {
        DevSettings.reload()
      },
      preventClose: true,
    })

    ITEMS.push({
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
    frequentlyUsedEmojis: {} as Record<string, number>,
    notes: [''] as string[],
    isAccessibilityTrusted: false,
    calendarAuthorizationStatus: 'notDetermined' as CalendarAuthorizationStatus,
    onboardingStep: 'v1_start' as OnboardingStep,
    globalShortcut: 'option' as 'command' | 'option',
    scratchpadShortcut: 'command' as 'command' | 'option',
    showWindowOn: 'screenWithFrontmost' as
      | 'screenWithFrontmost'
      | 'screenWithCursor',
    clipboardManagerShortcut: 'shift' as 'shift' | 'option',
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
    isLoading: false,
    translationResults: null as null | {
      en: string | undefined
      de: string | undefined
    },
    frequencies: {} as Record<string, number>,
    temporaryResult: null as string | null,
    track: null as
      | {title: string; artist: string; artwork: string; url: string}
      | null
      | undefined,
    commandPressed: false,
    shiftPressed: false,
    projects: [] as ITrackingProject[],
    tempProjectName: '' as string,
    currentlyTrackedProjectId: null as string | null,
    weatherApiKey: '' as string,
    weatherLat: '' as string,
    weatherLon: '' as string,
    launchAtLogin: false,
    firstTranslationLanguage: 'en' as string,
    secondTranslationLanguage: 'de' as string,
    gifs: [] as any[],
    temporaryTextInputSelection: 0 as number,
    githubSearchEnabled: false,
    githubSearchResults: [] as GithubRepo[],
    // TODO(osp) this token should be placed in secure storage, but too lazy to do it right now
    githubToken: null as string | null,
    fileResults: [] as FileDescription[],

    //    _____                            _           _
    //   / ____|                          | |         | |
    //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
    //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
    //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
    //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
    //                        | |
    //                        |_|
    get favoriteItems(): Item[] {
      const items = [...store.apps, ...ITEMS, ...store.customItems]
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
      if (!store.query) {
        return store.favoriteItems
      }

      const allItems = [
        ...store.apps,
        ...ITEMS.map(i => {
          if (i.name === 'Clipboard Manager') {
            return {
              ...i,
              shortcut:
                store.clipboardManagerShortcut === 'option'
                  ? '⌘ + ⌥ + V'
                  : '⌘ + ⇧ + V',
            }
          }

          return i
        }),
        ...store.customItems,
      ]

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

        // Return the fallback if we have a temporary result or no results
        const shouldReturnFallback =
          results.length === 0 || !!store.temporaryResult

        const temporaryResultItems = !!store.temporaryResult
          ? [{type: ItemType.TEMPORARY_RESULT, name: ''}]
          : []

        const finalResults = [
          ...(CONSTANTS.LESS_VALID_URL.test(store.query)
            ? [
                {
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
                },
              ]
            : []),
          ...temporaryResultItems,
          ...results,
          ...(shouldReturnFallback ? FALLBACK_ITEMS : []),
          ...store.fileResults.map(f => ({
            name: f.filename,
            subName:
              f.path.length > 60
                ? `...${f.path.substring(f.path.length - 60, f.path.length)}`
                : f.path,
            type: ItemType.CUSTOM,
            iconComponent: () => <FileIcon url={f.path} style={tw`w-4 h-4`} />,
            callback: () => {
              Linking.openURL(f.path)
            },
            metaCallback: () => {
              if (f.kind !== 'Folder') {
                Linking.openURL(f.location)
              }
            },
          })),
        ]

        if (store.githubSearchEnabled) {
          finalResults.concat(
            store.githubSearchResults.map(
              (s): Item => ({
                name: `${s.owner?.login}/${s.name}`,
                type: ItemType.APPLICATION,
                iconComponent: () => {
                  const colorScheme = Appearance.getColorScheme()

                  return (
                    <Image
                      source={Icons.Github}
                      style={tw.style('w-3 h-3 p-1 mr-1', {
                        tintColor: colorScheme === 'dark' ? 'white' : 'black',
                      })}
                    />
                  )
                },
                callback: () => {
                  Linking.openURL(s.html_url)
                },
              }),
            ),
          )
        }

        return finalResults
      } else {
        return allItems
      }
    },
    get filteredEvents(): INativeEvent[] {
      return store.events
        .filter(e => !e.isAllDay && e.status !== 3)
        .filter(e => {
          if (!!store.query) {
            return e.title?.includes(store.query)
          }

          return true
        })
        .slice(0, 3)
    },
    get groupedEvents(): Record<
      string,
      {date: DateTime; events: Array<INativeEvent>}
    > {
      return store.filteredEvents.reduce((acc, event) => {
        const lDate = DateTime.fromISO(event.date)
        const relativeDate = lDate.toRelativeCalendar()!

        if (!acc[relativeDate]) {
          acc[relativeDate] = {date: lDate, events: [event]}
        } else {
          acc[relativeDate].events.push(event)
        }
        return acc
      }, {} as Record<string, {date: DateTime; events: Array<INativeEvent>}>)
    },
    get currentItem(): Item {
      return store.items[store.selectedIndex]
    },
    //                _   _
    //      /\       | | (_)
    //     /  \   ___| |_ _  ___  _ __  ___
    //    / /\ \ / __| __| |/ _ \| '_ \/ __|
    //   / ____ \ (__| |_| | (_) | | | \__ \
    //  /_/    \_\___|\__|_|\___/|_| |_|___/
    insertEmojiAt(index: number) {
      const favorites = Object.entries(store.frequentlyUsedEmojis).sort(
        ([_, freq1], [_2, freq2]) => freq2 - freq1,
      )

      const data = !!store.query
        ? emojiFuse.search(store.query).map(r => r.item)
        : allEmojis

      let emojiChar = data[index].emoji
      if (favorites.length && !store.query) {
        if (index < EMOJIS_PER_ROW) {
          emojiChar = favorites[index]?.[0]
          if (!emojiChar) {
            return
          }
        } else {
          emojiChar = data[index - EMOJIS_PER_ROW].emoji
        }
      }

      if (store.frequentlyUsedEmojis[emojiChar]) {
        store.frequentlyUsedEmojis[emojiChar] += 1
      } else {
        if (favorites.length === EMOJIS_PER_ROW) {
          let leastUsed = favorites[0]
          favorites.forEach(([emoji, frequency]) => {
            if (frequency < leastUsed[1]) {
              leastUsed = [emoji, frequency]
            }
          })

          delete store.frequentlyUsedEmojis[leastUsed[0]]

          store.frequentlyUsedEmojis[emojiChar] = 1
        } else {
          store.frequentlyUsedEmojis[emojiChar] = 1
        }
      }

      solNative.insertToFrontmostApp(emojiChar)
    },
    setGithubToken: (token: string) => {
      store.githubToken = token
    },
    setGithubSearchEnabled: (v: boolean) => {
      store.githubSearchEnabled = v
    },
    handleDeletePressOnScrachpad: (): boolean => {
      if (store.shiftPressed) {
        // if (store.selectedIndex >= store.notes.length) {
        //   store.selectedIndex = store.notes.length - 1
        // }

        // Clipboard.setString(store.notes[store.selectedIndex])
        store.removeNote(store.selectedIndex)

        return true
      }

      return false
    },
    handleEnterPressOnScratchpad: (): boolean => {
      if (store.shiftPressed) {
        if (store.notes[0] === '') {
          return true
        }

        store.notes.unshift('')
        store.selectedIndex = 0
        return true
      }

      return false
    },
    showGifPicker: () => {
      store.focusWidget(FocusableWidget.GIFS)
      store.query = ''
      store.searchGifs()
    },
    searchGifs: async () => {
      let gifs: any[] = []

      if (store.query) {
        const {data} = await gf.search(store.query, {limit: 15})
        gifs = data
      } else {
        const {data} = await gf.trending({limit: 15})
        gifs = data
      }

      runInAction(() => {
        store.gifs = gifs
      })
    },
    showEmojiPicker: () => {
      store.focusWidget(FocusableWidget.EMOJIS)
      store.query = ''
    },
    showSettings: () => {
      store.focusWidget(FocusableWidget.SETTINGS)
    },
    removeNote: (idx: number) => {
      let newNotes = [...store.notes]
      newNotes.splice(idx, 1)

      if (newNotes.length === 0) {
        newNotes = ['']
      }

      store.notes = newNotes
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
      }
    },
    toggleFavorite: (item: Item) => {
      const favorites = [...store.favorites]

      if (favorites.includes(item.name)) {
        const foundIndex = favorites.indexOf(item.name)
        favorites.splice(foundIndex, 1)
        store.favorites = favorites
      } else {
        if (favorites.length === 5) {
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
    setScratchpadShortcut: (key: 'command' | 'option') => {
      solNative.setScratchpadShortcut(key)
      store.scratchpadShortcut = key
    },
    setShowWindowOn: (on: 'screenWithFrontmost' | 'screenWithCursor') => {
      solNative.setShowWindowOn(on)
      store.showWindowOn = on
    },
    setClipboardManagerShortcut: (key: 'shift' | 'option') => {
      solNative.setClipboardManagerShortcut(key)
      store.clipboardManagerShortcut = key
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
      store.query = query
      store.selectedIndex = 0

      if (store.focusedWidget === FocusableWidget.SEARCH) {
        try {
          const res = exprParser.evaluate(store.query)
          if (res && typeof res !== 'function') {
            store.temporaryResult = res.toString()
          } else {
            store.temporaryResult = null
          }
        } catch (e) {
          store.temporaryResult = null
        }

        if (store.githubSearchEnabled) {
          store.searchGithubRepos()
        }

        store.fetchEvents()

        if (!query) {
          store.fileResults = []
        } else {
          solNative.searchFiles(query)
        }
      }
    },
    searchGithubRepos: debounce(async () => {
      if (store.query) {
        try {
          runInAction(() => {
            store.githubSearchResults = []
            store.isLoading = true
          })
          const repos = await searchGithubRepos(store.query, store.githubToken)
          runInAction(() => {
            store.isLoading = false
            store.githubSearchResults = repos.items
          })
        } catch (e) {
          runInAction(() => {
            store.isLoading = false
          })
        }
      }
    }, 500),
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
      // console.warn('keyCode', keyCode)
      switch (keyCode) {
        // delete key
        case 51: {
          if (store.focusedWidget === FocusableWidget.SCRATCHPAD) {
            store.handleDeletePressOnScrachpad()
          }

          if (
            store.focusedWidget === FocusableWidget.SEARCH &&
            store.currentItem.type === ItemType.CUSTOM &&
            store.shiftPressed
          ) {
            const newItems = store.customItems.filter(
              c => c.name !== store.currentItem.name,
            )
            store.customItems = newItems
          }
          break
        }
        // tab key
        case 48: {
          let nextWidget = store.focusedWidget

          switch (store.focusedWidget) {
            case FocusableWidget.SEARCH:
              if (!!store.events.length) {
                store.selectedIndex = 0
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

        // enter key
        case 36: {
          switch (store.focusedWidget) {
            case FocusableWidget.CLIPBOARD: {
              const entry = root.clipboard.clipboardItems[store.selectedIndex]

              const originalIndex = root.clipboard.clipboardItems.findIndex(
                e => entry === e,
              )
              root.clipboard.unshift(originalIndex)

              if (entry) {
                if (meta) {
                  try {
                    Linking.openURL(entry)
                  } catch (e) {
                    console.warn('could not open in browser')
                  }
                  solNative.hideWindow()
                } else {
                  solNative.pasteToFrontmostApp(entry)
                }
              }

              break
            }

            case FocusableWidget.GIFS: {
              const gif = store.gifs[store.selectedIndex]

              solNative.pasteToFrontmostApp(
                gif.images.downsized.url
                  .replace('media1.giphy.com', 'media.giphy.com')
                  .replace('media3.giphy.com', 'media.giphy.com'),
              )
              break
            }

            case FocusableWidget.EMOJIS: {
              store.insertEmojiAt(store.selectedIndex)
              break
            }

            // Enter listener is disabled while using the scratch pad
            case FocusableWidget.SCRATCHPAD: {
              break
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
                  store.setLaunchAtLogin(true)
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
              const event = store.filteredEvents[store.selectedIndex]
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

              if (store.commandPressed && item.metaCallback) {
                item.metaCallback()
              } else if (item.url) {
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
          switch (store.focusedWidget) {
            case FocusableWidget.SEARCH:
            case FocusableWidget.GIFS:
            case FocusableWidget.EMOJIS:
            case FocusableWidget.SCRATCHPAD:
            case FocusableWidget.CLIPBOARD:
            case FocusableWidget.GOOGLE_MAP:
              solNative.hideWindow()
              break

            default:
              store.setQuery('')
              store.focusWidget(FocusableWidget.SEARCH)
              break
          }
          break
        }

        // left key
        case 123: {
          switch (store.focusedWidget) {
            case FocusableWidget.GIFS:
            case FocusableWidget.EMOJIS:
              store.selectedIndex = Math.max(store.selectedIndex - 1, 0)
              break
          }
          break
        }

        // right key
        case 124: {
          switch (store.focusedWidget) {
            case FocusableWidget.GIFS:
            case FocusableWidget.EMOJIS:
              store.selectedIndex += 1
              break
          }
          break
        }

        // up key
        case 126: {
          switch (store.focusedWidget) {
            case FocusableWidget.SCRATCHPAD:
              return
            case FocusableWidget.EMOJIS:
              store.selectedIndex = Math.max(
                store.selectedIndex - EMOJIS_PER_ROW,
                0,
              )
              break

            case FocusableWidget.GIFS:
              store.selectedIndex = Math.max(
                store.selectedIndex - GIFS_PER_ROW,
                0,
              )
              break

            default:
              store.selectedIndex = Math.max(0, store.selectedIndex - 1)
              break
          }
          break
        }

        // down key
        case 125: {
          switch (store.focusedWidget) {
            case FocusableWidget.CLIPBOARD: {
              store.selectedIndex = Math.min(
                store.selectedIndex + 1,
                root.clipboard.items.length - 1,
              )
              break
            }

            case FocusableWidget.GIFS: {
              store.selectedIndex = store.selectedIndex + GIFS_PER_ROW
              break
            }

            case FocusableWidget.EMOJIS: {
              store.selectedIndex = store.selectedIndex + EMOJIS_PER_ROW
              break
            }

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

        // meta key
        case 55: {
          store.commandPressed = true
          break
        }

        // shift key
        case 60: {
          store.shiftPressed = true
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

        case 60: {
          store.shiftPressed = false
          break
        }

        default:
          break
      }
    },
    onShow: ({target}: {target?: string}) => {
      if (target === FocusableWidget.CLIPBOARD) {
        store.showClipboardManager()
        return
      }

      if (target === FocusableWidget.SCRATCHPAD) {
        store.showScratchpad()
        return
      }

      if (target === FocusableWidget.EMOJIS) {
        store.showEmojiPicker()
        return
      }

      if (target === FocusableWidget.SETTINGS) {
        store.showSettings()
        return
      }

      store.now = DateTime.now()

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
      onFileSearchListener?.remove()
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
    showClipboardManager: () => {
      store.query = ''
      store.focusWidget(FocusableWidget.CLIPBOARD)
    },
    onFileSearch: (files: FileDescription[]) => {
      store.fileResults = files
    },
  })

  hydrate().then(() => {
    autorun(persist)
    store.checkCalendarAccess()
    store.checkAccessibilityStatus()
  })

  keyDownListener = solNative.addListener('keyDown', store.keyDown)
  keyUpListener = solNative.addListener('keyUp', store.keyUp)
  onShowListener = solNative.addListener('onShow', store.onShow)
  onHideListener = solNative.addListener('onHide', store.onHide)
  onFileSearchListener = solNative.addListener(
    'onFileSearch',
    store.onFileSearch,
  )

  return store
}
