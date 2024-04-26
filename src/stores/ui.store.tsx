import AsyncStorage from '@react-native-async-storage/async-storage'
import {Assets} from 'assets'
import {FileIcon} from 'components/FileIcon'
import {FUSE_OPTIONS} from 'config'
import {Parser} from 'expr-eval'
import Fuse from 'fuse.js'
import {solNative} from 'lib/SolNative'
import {CONSTANTS} from 'lib/constants'
import {googleTranslate} from 'lib/translator'
import {autorun, makeAutoObservable, runInAction, toJS} from 'mobx'
import React from 'react'
import {Appearance, EmitterSubscription, Linking} from 'react-native'
import {IRootStore} from 'store'
import {createBaseItems} from './items'
import plist from '@expo/plist'

const exprParser = new Parser()

let onShowListener: EmitterSubscription | undefined
let onHideListener: EmitterSubscription | undefined
let onFileSearchListener: EmitterSubscription | undefined

export enum Widget {
  ONBOARDING = 'ONBOARDING',
  SEARCH = 'SEARCH',
  CALENDAR = 'CALENDAR',
  TRANSLATION = 'TRANSLATION',
  SETTINGS = 'SETTINGS',
  CREATE_ITEM = 'CREATE_ITEM',
  GOOGLE_MAP = 'GOOGLE_MAP',
  SCRATCHPAD = 'SCRATCHPAD',
  EMOJIS = 'EMOJIS',
  CLIPBOARD = 'CLIPBOARD',
  PROCESSES = 'PROCESSES',
}

export enum ItemType {
  APPLICATION = 'APPLICATION',
  CONFIGURATION = 'CONFIGURATION',
  CUSTOM = 'CUSTOM',
  TEMPORARY_RESULT = 'TEMPORARY_RESULT',
  BOOKMARK = 'BOOKMARK',
  PREFERENCE_PANE = 'PREFERENCE_PANE',
}

export type UIStore = ReturnType<typeof createUIStore>

export const createUIStore = (root: IRootStore) => {
  let persist = async () => {
    let plainState = toJS(store)
    AsyncStorage.setItem('@ui.store', JSON.stringify(plainState))
  }

  let hydrate = async () => {
    const storeState = await AsyncStorage.getItem('@ui.store')

    if (storeState) {
      let parsedStore = JSON.parse(storeState)

      runInAction(() => {
        store.frequencies = parsedStore.frequencies
        store.onboardingStep = parsedStore.onboardingStep
        store.firstTranslationLanguage =
          parsedStore.firstTranslationLanguage ?? 'en'
        store.secondTranslationLanguage =
          parsedStore.secondTranslationLanguage ?? 'de'
        store.thirdTranslationLanguage =
          parsedStore.thirdTranslationLanguage ?? null
        store.customItems = parsedStore.customItems ?? []
        if (
          store.onboardingStep !== 'v1_completed' &&
          store.onboardingStep !== 'v1_skipped'
        ) {
          store.focusedWidget = Widget.ONBOARDING
        }
        store.note = parsedStore.note ?? ''
        // temporary code to prevent loss of data
        if (parsedStore.notes) {
          store.note = parsedStore.notes.reduce((acc: string, n: string) => {
            return acc + '\n' + n
          }, '')
        }
        store.globalShortcut = parsedStore.globalShortcut
        store.scratchpadShortcut = parsedStore.scratchpadShortcut ?? 'command'
        store.clipboardManagerShortcut =
          parsedStore.clipboardManagerShortcut ?? 'shift'
        store.showWindowOn = parsedStore.showWindowOn ?? 'screenWithFrontmost'
        store.windowManagementEnabled =
          parsedStore.windowManagementEnabled ?? true
        store.calendarEnabled = parsedStore.calendarEnabled ?? true
        store.showAllDayEvents = parsedStore.showAllDayEvents ?? true
        store.launchAtLogin = parsedStore.launchAtLogin ?? true
        store.useBackgroundOverlay = parsedStore.useBackgroundOverlay ?? true
        store.shouldHideMenubar = parsedStore.shouldHideMenuBar ?? false
        store.mediaKeyForwardingEnabled = parsedStore.mediaKeyForwarding ?? true
        store.reduceTransparency = parsedStore.reduceTransparency ?? false
        store.history = parsedStore.history ?? []
        store.showUpcomingEvent = parsedStore.showUpcomingEvent ?? true
      })

      solNative.setLaunchAtLogin(parsedStore.launchAtLogin ?? true)
      solNative.setGlobalShortcut(parsedStore.globalShortcut)
      solNative.setScratchpadShortcut(parsedStore.scratchpadShortcut)
      solNative.setClipboardManagerShortcut(
        parsedStore.clipboardManagerShortcut,
      )
      solNative.setShowWindowOn(
        parsedStore.showWindowOn ?? 'screenWithFrontmost',
      )
      solNative.setWindowManagement(store.windowManagementEnabled)
      solNative.useBackgroundOverlay(store.useBackgroundOverlay)
      solNative.shouldHideMenubar(store.shouldHideMenubar)
      solNative.setMediaKeyForwardingEnabled(store.mediaKeyForwardingEnabled)
    } else {
      runInAction(() => {
        store.focusedWidget = Widget.ONBOARDING
      })
    }
  }

  let baseItems = createBaseItems(root)

  let store = makeAutoObservable({
    //    ____  _                              _     _
    //   / __ \| |                            | |   | |
    //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
    //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
    //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
    //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
    note: '',
    isAccessibilityTrusted: false,
    calendarAuthorizationStatus: 'notDetermined' as CalendarAuthorizationStatus,
    onboardingStep: 'v1_start' as OnboardingStep,
    globalShortcut: 'option' as 'command' | 'option' | 'control',
    scratchpadShortcut: 'command' as 'command' | 'option' | 'none',
    clipboardManagerShortcut: 'shift' as 'shift' | 'option' | 'none',
    showWindowOn: 'screenWithFrontmost' as
      | 'screenWithFrontmost'
      | 'screenWithCursor',
    query: '',
    selectedIndex: 0,
    focusedWidget: Widget.SEARCH,
    events: [] as INativeEvent[],
    customItems: [] as Item[],
    apps: [] as Item[],
    isLoading: false,
    translationResults: [] as string[],
    frequencies: {} as Record<string, number>,
    temporaryResult: null as string | null,
    firstTranslationLanguage: 'en' as string,
    secondTranslationLanguage: 'de' as string,
    thirdTranslationLanguage: null as null | string,
    fileResults: [] as FileDescription[],
    windowManagementEnabled: true,
    calendarEnabled: true,
    showAllDayEvents: true,
    launchAtLogin: true,
    useBackgroundOverlay: true,
    shouldHideMenubar: false,
    hasFullDiskAccess: false,
    safariBookmarks: [] as {title: string; url: string}[],
    braveBookmarks: [] as {title: string; url: string}[],
    chromeBookmarks: [] as {title: string; url: string}[],
    mediaKeyForwardingEnabled: true,
    targetHeight: 64,
    isDarkMode: Appearance.getColorScheme() === 'dark',
    reduceTransparency: false,
    history: [] as string[],
    historyPointer: 0,
    showUpcomingEvent: true,
    //    _____                            _           _
    //   / ____|                          | |         | |
    //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
    //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
    //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
    //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
    //                        | |
    //                        |_|

    get items(): Item[] {
      const allItems = [
        ...store.apps,
        ...baseItems.map(i => {
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
        ...store.safariBookmarks.map((bookmark): Item => {
          return {
            name: bookmark.title,
            type: ItemType.BOOKMARK,
            iconImage: Assets.Safari,
            callback: () => {
              Linking.openURL(bookmark.url)
            },
          }
        }),
        ...store.braveBookmarks.map((bookmark): Item => {
          return {
            name: bookmark.title,
            type: ItemType.BOOKMARK,
            iconImage: Assets.Brave,
            callback: () => {
              Linking.openURL(bookmark.url)
            },
          }
        }),
        ...store.chromeBookmarks.map((bookmark): Item => {
          return {
            name: bookmark.title,
            type: ItemType.BOOKMARK,
            iconImage: Assets.Chrome,
            callback: () => {
              Linking.openURL(bookmark.url)
            },
          }
        }),
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
          ...store.fileResults.map(f => ({
            name: f.filename,
            subName:
              f.path.length > 60
                ? `...${f.path.substring(f.path.length - 60, f.path.length)}`
                : f.path,
            type: ItemType.CONFIGURATION,
            IconComponent: (...props: any[]) => (
              <FileIcon url={f.path} className="w-4 h-4" {...props} />
            ),
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

        return finalResults
      } else {
        return allItems
      }
    },

    get currentItem(): Item | undefined {
      return store.items[store.selectedIndex]
    },
    //                _   _
    //      /\       | | (_)
    //     /  \   ___| |_ _  ___  _ __  ___
    //    / /\ \ / __| __| |/ _ \| '_ \/ __|
    //   / ____ \ (__| |_| | (_) | | | \__ \
    //  /_/    \_\___|\__|_|\___/|_| |_|___/
    setShowUpcomingEvent: (v: boolean) => {
      store.showUpcomingEvent = v
    },
    showEmojiPicker: () => {
      store.focusWidget(Widget.EMOJIS)
      store.query = ''
    },
    showSettings: () => {
      store.focusWidget(Widget.SETTINGS)
    },
    setSelectedIndex: (idx: number) => {
      store.selectedIndex = idx
    },
    setNote: (note: string) => {
      store.note = note
    },
    createCustomItem: (item: Item) => {
      store.customItems.push(item)
    },
    translateQuery: async () => {
      store.isLoading = true
      store.translationResults = []
      store.focusedWidget = Widget.TRANSLATION
      store.selectedIndex = 0

      try {
        const translations = await googleTranslate(
          store.firstTranslationLanguage,
          store.secondTranslationLanguage,
          store.thirdTranslationLanguage,
          store.query,
        )

        runInAction(() => {
          store.translationResults = translations
          store.isLoading = false
        })
      } catch (e) {
        runInAction(() => {
          store.isLoading = false
        })
      }
    },
    openKeyboardSettings: () => {
      try {
        Linking.openURL(`/System/Library/PreferencePanes/Keyboard.prefPane`)
      } catch (e) {
        console.error(`Could not open keyboard preferences ${e}`)
      }
    },
    setFirstTranslationLanguage: (l: string) => {
      store.firstTranslationLanguage = l
    },
    setSecondTranslationLanguage: (l: string) => {
      store.secondTranslationLanguage = l
    },
    setThirdTranslationLanguage: (l: string) => {
      store.thirdTranslationLanguage = l
    },
    setOnboardingStep: (step: OnboardingStep) => {
      store.onboardingStep = step
    },
    setGlobalShortcut: (key: 'command' | 'option' | 'control') => {
      solNative.setGlobalShortcut(key)
      store.globalShortcut = key
    },
    setScratchpadShortcut: (key: 'command' | 'option' | 'none') => {
      solNative.setScratchpadShortcut(key)
      store.scratchpadShortcut = key
    },
    setShowWindowOn: (on: 'screenWithFrontmost' | 'screenWithCursor') => {
      solNative.setShowWindowOn(on)
      store.showWindowOn = on
    },
    setClipboardManagerShortcut: (key: 'shift' | 'option' | 'none') => {
      solNative.setClipboardManagerShortcut(key)
      store.clipboardManagerShortcut = key
    },
    focusWidget: (widget: Widget) => {
      store.selectedIndex = 0
      store.focusedWidget = widget
    },
    setFocus: (widget: Widget) => {
      store.focusedWidget = widget
    },
    setQuery: (query: string) => {
      store.query = query.replace('\n', ' ')
      store.selectedIndex = 0

      if (store.focusedWidget === Widget.SEARCH) {
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

        if (query === 'ip') {
          let info = solNative.getWifiInfo()
          if (info.ip) {
            store.temporaryResult = info.ip
          }
        }
      }
    },
    onShow: ({target}: {target?: string}) => {
      if (target === Widget.CLIPBOARD) {
        store.showClipboardManager()
        return
      }

      if (target === Widget.SCRATCHPAD) {
        store.showScratchpad()
        return
      }

      if (target === Widget.EMOJIS) {
        store.showEmojiPicker()
        return
      }

      if (target === Widget.SETTINGS) {
        store.showSettings()
        return
      }

      solNative.getApps().then(apps => {
        // Each "app" is a macOS file url, e.g. file:///Applications/SF%20Symbols
        const cleanApps = apps
          .map(({name, url, isRunning}) => {
            const plistPath = decodeURIComponent(
              url.replace('file://', '') + 'Contents/Info.plist',
            )
            let alias = null
            if (solNative.exists(plistPath)) {
              let plistContent = solNative.readFile(plistPath)

              try {
                const properties = plist.parse(plistContent)
                alias = properties.CFBundleIdentifier
              } catch (e) {
                // intentionally left blank
              }
            }

            return {
              type: ItemType.APPLICATION as ItemType.APPLICATION,
              url: decodeURI(url.replace('file://', '')),
              name: name,
              isRunning,
              alias,
            } as Item
          })
          .filter(app => app.name !== 'sol')

        runInAction(() => {
          store.apps = cleanApps
        })
      })

      setImmediate(() => {
        if (!store.isAccessibilityTrusted) {
          store.getAccessibilityStatus()
        }

        store.getFullDiskAccessStatus()
      })
    },
    onHide: () => {
      store.focusedWidget = Widget.SEARCH
      store.setQuery('')
      store.selectedIndex = 0
      store.translationResults = []
      store.historyPointer = 0
    },
    cleanUp: () => {
      onShowListener?.remove()
      onHideListener?.remove()
      onFileSearchListener?.remove()
    },
    getCalendarAccess: () => {
      store.calendarAuthorizationStatus =
        solNative.getCalendarAuthorizationStatus()
    },
    getAccessibilityStatus: () => {
      solNative.getAccessibilityStatus().then(v => {
        runInAction(() => {
          store.isAccessibilityTrusted = v
        })
      })
    },
    showScratchpad: () => {
      store.focusWidget(Widget.SCRATCHPAD)
    },
    showClipboardManager: () => {
      store.query = ''
      store.focusWidget(Widget.CLIPBOARD)
    },
    showProcessManager: () => {
      store.query = ''
      store.focusWidget(Widget.PROCESSES)
    },
    onFileSearch: (files: FileDescription[]) => {
      store.fileResults = files
    },
    setWindowManagementEnabled: (v: boolean) => {
      store.windowManagementEnabled = v
      solNative.setWindowManagement(v)
    },
    setCalendarEnabled: (v: boolean) => {
      store.calendarEnabled = v
      if (v) {
        root.calendar.poll()
      }
    },
    setShowAllDayEvents: (v: boolean) => {
      store.showAllDayEvents = v
    },
    setLaunchAtLogin: (v: boolean) => {
      store.launchAtLogin = v
      solNative.setLaunchAtLogin(v)
    },
    setUseBackgroundOverlay: (v: boolean) => {
      store.useBackgroundOverlay = v
      solNative.useBackgroundOverlay(v)
    },
    setShouldHideMenuBar: (v: boolean) => {
      store.shouldHideMenubar = v
      if (v) {
        solNative.showToast('Menubar will be blacked out, please wait...')
      } else {
        solNative.showToast('Done, please restore your wallpaper manually')
      }
      solNative.shouldHideMenubar(v)
    },
    getFullDiskAccessStatus: async () => {
      const hasAccess = await solNative.hasFullDiskAccess()
      runInAction(() => {
        store.hasFullDiskAccess = hasAccess
        if (hasAccess) {
          store.getSafariBookmarks()
        }
      })
      store.getBraveBookmarks()
      store.getChromeBookmarks()
    },
    getSafariBookmarks: async () => {
      if (store.hasFullDiskAccess) {
        const safariBookmarks = await solNative.getSafariBookmarks()

        runInAction(() => {
          store.safariBookmarks = safariBookmarks
        })
      }
    },
    getBraveBookmarks: async () => {
      const username = solNative.userName()
      const path = `/Users/${username}/Library/Application Support/BraveSoftware/Brave-Browser/Default/Bookmarks`
      const exists = solNative.exists(path)
      if (exists) {
        const bookmarksString = solNative.readFile(path)
        const OGbookmarks = JSON.parse(bookmarksString)
        let bookmarks = OGbookmarks.roots.bookmark_bar.children.map(
          (v: any) => ({
            title: v.name,
            url: v.url,
          }),
        )

        store.braveBookmarks = bookmarks
      }
    },
    getChromeBookmarks: async () => {
      const username = solNative.userName()
      const path = `/Users/${username}/Library/Application Support/Google/Chrome/Default/Bookmarks`
      const exists = solNative.exists(path)
      if (exists) {
        const bookmarksString = solNative.readFile(path)
        const OGbookmarks = JSON.parse(bookmarksString)
        let bookmarks = OGbookmarks.roots.bookmark_bar.children.map(
          (v: any) => ({
            title: v.name,
            url: v.url,
          }),
        )

        store.chromeBookmarks = bookmarks
      }
    },

    setMediaKeyForwardingEnabled: (enabled: boolean) => {
      store.mediaKeyForwardingEnabled = enabled
      solNative.setMediaKeyForwardingEnabled(enabled)
    },

    setTargetHeight: (height: number) => {
      store.targetHeight = height
    },

    onColorSchemeChange({
      colorScheme,
    }: {
      colorScheme: 'light' | 'dark' | null | undefined
    }) {
      store.isDarkMode = colorScheme === 'dark'
    },

    setReduceTransparency: (v: boolean) => {
      store.reduceTransparency = v
    },

    addToHistory: (query: string) => {
      store.history.push(query)
    },

    setHistoryPointer: (pointer: number) => {
      if (pointer > store.history.length - 1) {
        return
      }
      store.historyPointer = pointer
    },
  })

  Appearance.addChangeListener(store.onColorSchemeChange)

  hydrate().then(() => {
    autorun(persist)
    store.getCalendarAccess()
    store.getAccessibilityStatus()
    store.getFullDiskAccessStatus()
  })

  onShowListener = solNative.addListener('onShow', store.onShow)
  onHideListener = solNative.addListener('onHide', store.onHide)
  onFileSearchListener = solNative.addListener(
    'onFileSearch',
    store.onFileSearch,
  )

  return store
}
