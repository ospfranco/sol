import AsyncStorage from '@react-native-async-storage/async-storage'
import {Assets} from 'assets'
import {Parser} from 'expr-eval'
import {solNative} from 'lib/SolNative'
import {CONSTANTS} from 'lib/constants'
import {googleTranslate} from 'lib/translator'
import {
  autorun,
  IReactionDisposer,
  makeAutoObservable,
  reaction,
  runInAction,
  toJS,
} from 'mobx'
import {
  Appearance,
  EmitterSubscription,
  Linking,
  NativeEventSubscription,
} from 'react-native'
import {IRootStore} from 'store'
import {createBaseItems} from './items'
import MiniSearch from 'minisearch'
import * as Sentry from '@sentry/react-native'
import {storage} from './storage'
import {defaultShortcuts} from 'lib/shorcuts'

const exprParser = new Parser()

let onShowListener: EmitterSubscription | undefined
let onHideListener: EmitterSubscription | undefined
let onFileSearchListener: EmitterSubscription | undefined
let onHotkeyListener: EmitterSubscription | undefined
let onAppsChangedListener: EmitterSubscription | undefined
let appareanceListener: NativeEventSubscription | undefined
let bookmarksDisposer: IReactionDisposer | undefined

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
  FILE_SEARCH = 'FILE_SEARCH',
}

export enum ItemType {
  FILE = 'FILE',
  APPLICATION = 'APPLICATION',
  CONFIGURATION = 'CONFIGURATION',
  CUSTOM = 'CUSTOM',
  TEMPORARY_RESULT = 'TEMPORARY_RESULT',
  BOOKMARK = 'BOOKMARK',
  PREFERENCE_PANE = 'PREFERENCE_PANE',
}

export enum ScratchPadColor {
  SYSTEM = 'SYSTEM',
  BLUE = 'BLUE',
  ORANGE = 'ORANGE',
}

let minisearch = new MiniSearch({
  fields: ['name', 'alias'],
  storeFields: [
    'name',
    'icon',
    'iconName',
    'iconImage',
    'IconComponent',
    'color',
    'url',
    'preventClose',
    'type',
    'alias',
    'subName',
    'callback',
    'metaCallback',
    'isApplescript',
    'text',
    'shortcut',
    'isFavorite',
    'isRunning',
    'bookmarkFolder',
    'faviconFallback',
  ],
  tokenize: (text: string, fieldName?: string) =>
    text.toLowerCase().split(/[\s\.-]+/),
})

const userName = solNative.userName()
let defaultSearchFolders = [
  `/Users/${userName}/Downloads`,
  `/Users/${userName}/Documents`,
  `/Users/${userName}/Desktop`,
  `/Users/${userName}/Pictures`,
  `/Users/${userName}/Movies`,
  `/Users/${userName}/Music`,
]

export type UIStore = ReturnType<typeof createUIStore>
type SearchEngine = 'google' | 'bing' | 'duckduckgo' | 'perplexity' | 'custom'

const itemsThatShouldShowWindow = [
  'emoji_picker',
  'clipboard_manager',
  'process_manager',
  'scratchpad',
]

function getInitials(name: string) {
  return name
    .toLowerCase()
    .split(' ')
    .map(s => s.charAt(0))
    .join('')
}

function traverse(
  bookmarks: any[],
  nodes: any[],
  bookmarkFolder: null | string,
) {
  nodes.forEach(node => {
    if (node.type === 'folder') {
      traverse(bookmarks, node.children, node.name)
    } else if (node.type === 'url') {
      bookmarks.push({title: node.name, url: node.url, bookmarkFolder})
    }
  })
}

export const createUIStore = (root: IRootStore) => {
  let persist = async () => {
    let plainState = toJS(store)
    try {
      storage.set('@ui.store', JSON.stringify(plainState))
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  let hydrate = async () => {
    let storeState: string | null | undefined
    try {
      storeState = storage.getString('@ui.store')
    } catch {
      // intentionally left blank
    }
    if (!storeState) {
      storeState = await AsyncStorage.getItem('@ui.store')
    }

    if (storeState) {
      let parsedStore = JSON.parse(storeState)

      runInAction(() => {
        if (parsedStore.frequencies) {
          const values = Object.values(parsedStore.frequencies)
          const maxValue = Math.max(...(values as number[]))
          if (maxValue > 100) {
            store.frequencies = Object.fromEntries(
              Object.entries(parsedStore.frequencies).map(([key, value]) => [
                key,
                Math.floor(((value as number) / maxValue) * 100),
              ]),
            )
          } else {
            store.frequencies = parsedStore.frequencies
          }
        }
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
        store.showWindowOn = parsedStore.showWindowOn ?? 'screenWithFrontmost'
        store.calendarEnabled = parsedStore.calendarEnabled ?? true
        store.showAllDayEvents = parsedStore.showAllDayEvents ?? true
        store.launchAtLogin = parsedStore.launchAtLogin ?? true
        store.mediaKeyForwardingEnabled =
          parsedStore.mediaKeyForwardingEnabled ?? true
        store.history = parsedStore.history ?? []
        store.showUpcomingEvent = parsedStore.showUpcomingEvent ?? true
        store.scratchPadColor =
          parsedStore.scratchPadColor ?? ScratchPadColor.SYSTEM
        store.searchFolders = parsedStore.searchFolders ?? defaultSearchFolders
        store.searchEngine = parsedStore.searchEngine ?? 'google'
        store.customSearchUrl =
          parsedStore.customSearchUrl ?? 'https://google.com/search?q=%s'
        store.shortcuts = parsedStore.shortcuts ?? defaultShortcuts
        store.showInAppBrowserBookMarks =
          parsedStore.showInAppBrowserBookMarks ?? true
        store.hasDismissedGettingStarted =
          parsedStore.hasDismissedGettingStarted ?? false
      })

      solNative.setLaunchAtLogin(parsedStore.launchAtLogin ?? true)
      solNative.setGlobalShortcut(parsedStore.globalShortcut)
      solNative.setShowWindowOn(
        parsedStore.showWindowOn ?? 'screenWithFrontmost',
      )
      solNative.setMediaKeyForwardingEnabled(store.mediaKeyForwardingEnabled)
      solNative.updateHotkeys(toJS(store.shortcuts))

      store.username = solNative.userName()
      store.getApps()
      store.migrateCustomItems()
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
    username: '',
    note: '',
    isAccessibilityTrusted: false,
    calendarAuthorizationStatus: null as CalendarAuthorizationStatus | null,
    onboardingStep: 'v1_start' as OnboardingStep,
    searchEngine: 'google' as SearchEngine,
    customSearchUrl: 'https://google.com/search?q=%s' as string,
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
    calendarEnabled: true,
    showAllDayEvents: true,
    launchAtLogin: true,
    hasFullDiskAccess: false,
    safariBookmarks: [] as Item[],
    braveBookmarks: [] as Item[],
    chromeBookmarks: [] as Item[],
    mediaKeyForwardingEnabled: true,
    targetHeight: 64,
    isDarkMode: Appearance.getColorScheme() === 'dark',
    history: [] as string[],
    historyPointer: 0,
    showUpcomingEvent: true,
    scratchPadColor: ScratchPadColor.SYSTEM,
    searchFolders: [] as string[],
    shortcuts: defaultShortcuts as Record<string, string>,
    showInAppBrowserBookMarks: true,
    hoveredEventId: null as string | null,
    hasDismissedGettingStarted: false,
    isVisible: false,
    showKeyboardRecorder: false,
    keyboardRecorderSelectedItem: null as string | null,
    confirmDialogShown: false,
    confirmCallback: null as (() => any) | null,
    confirmTitle: null as string | null,
    //    _____                            _           _
    //   / ____|                          | |         | |
    //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
    //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
    //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
    //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
    //                        | |
    //                        |_|
    get files(): Item[] {
      if (!!store.query && store.focusedWidget === Widget.FILE_SEARCH) {
        runInAction(() => {
          store.isLoading = true
        })
        const fileResults = solNative.searchFiles(
          toJS(store.searchFolders),
          store.query,
        )

        const results = fileResults.map(f => ({
          id: f.path,
          type: ItemType.FILE,
          name: f.name,
          url: f.path,
        }))
        runInAction(() => {
          store.isLoading = false
        })
        return results
      } else {
        return []
      }
    },
    get items(): Item[] {
      let allItems = [
        ...store.apps,
        ...baseItems,
        ...store.customItems,
        ...(store.showInAppBrowserBookMarks
          ? [
              ...store.safariBookmarks,
              ...store.braveBookmarks,
              ...store.chromeBookmarks,
            ]
          : []),
      ]

      // If the query is empty, return all items
      if (!store.query) {
        return allItems
      }

      if (minisearch.documentCount === 0) {
        minisearch.addAll(allItems)
      } else {
        for (let item of allItems) {
          if (!minisearch.has(item.id)) {
            minisearch.add(item)
          }
        }
      }

      let maxFreq = Math.max(...Object.values(store.frequencies))

      let results: Item[] = minisearch.search(store.query, {
        boost: {
          name: 2,
        },
        prefix: true,
        fuzzy: true,
        // Slightly boost items that have a frequency
        boostDocument: (
          documentId: any,
          term: string,
          storedFields?: Record<string, any>,
        ) => {
          const freq = store.frequencies[storedFields!.name] ?? 0
          if (freq === 0) {
            return 1
          }
          return maxFreq > 0 ? 1 + freq / maxFreq : 1
        },
      }) as any

      const temporaryResultItems = !!store.temporaryResult
        ? [{id: 'temporary', type: ItemType.TEMPORARY_RESULT, name: ''}]
        : []

      const finalResults: Item[] = [
        ...(CONSTANTS.LESS_VALID_URL.test(store.query)
          ? [
              {
                id: 'open_url',
                type: ItemType.CONFIGURATION,
                name: 'Open URL',
                icon: '🌎',
                callback: () => {
                  if (store.query.startsWith('https://')) {
                    Linking.openURL(store.query)
                  } else {
                    Linking.openURL(`https://${store.query}`)
                  }
                },
              },
            ]
          : []),
        ...temporaryResultItems,
        ...results,
      ]

      return finalResults
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
    setHoveredEventId: (id: string | null) => {
      store.hoveredEventId = id
    },
    rotateScratchPadColor: () => {
      if (store.scratchPadColor === ScratchPadColor.SYSTEM) {
        store.scratchPadColor = ScratchPadColor.BLUE
      } else if (store.scratchPadColor === ScratchPadColor.BLUE) {
        store.scratchPadColor = ScratchPadColor.ORANGE
      } else {
        store.scratchPadColor = ScratchPadColor.SYSTEM
      }
    },
    setShowUpcomingEvent: (v: boolean) => {
      store.showUpcomingEvent = v
      root.calendar.fetchEvents()
    },
    showEmojiPicker: () => {
      store.query = ''
      if (store.focusedWidget === Widget.EMOJIS) {
        store.focusedWidget = Widget.SEARCH
      } else {
        store.focusWidget(Widget.EMOJIS)
      }
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
    setShowWindowOn: (on: 'screenWithFrontmost' | 'screenWithCursor') => {
      solNative.setShowWindowOn(on)
      store.showWindowOn = on
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
    updateApps: (
      apps: Array<{name: string; url: string; isRunning: boolean}>,
    ) => {
      let appsRecord: Record<string, Item> = {}

      for (let {name, url, isRunning} of apps) {
        if (name === 'sol') {
          continue
        }

        let alias = getInitials(name)
        // const plistPath = decodeURIComponent(
        //   url.replace('file://', '') + 'Contents/Info.plist',
        // )

        // if (solNative.exists(plistPath)) {
        //   try {
        //     let plistContent = solNative.readFile(plistPath)
        //     if (plistContent != null) {
        //       const properties = plist.parse(plistContent)
        //       alias = properties.CFBundleIdentifier ?? '' + getInitials(name)
        //     } else {
        //       alias = getInitials(name)
        //     }
        //   } catch (e) {
        //     // intentionally left blank
        //   }
        // }

        appsRecord[url] = {
          id: url,
          type: ItemType.APPLICATION as ItemType.APPLICATION,
          url: decodeURI(url.replace('file://', '')),
          name: name,
          isRunning,
          alias,
        }
      }

      // minisearch is stupid and there is no way to remove a single item via scanning
      // so we remove all items and add them again
      minisearch.removeAll()

      runInAction(() => {
        store.apps = Object.values(appsRecord)
      })
    },
    getApps: () => {
      solNative.getApplications().then(apps => {
        store.updateApps(apps)
      })
    },
    onShow: ({target}: {target?: string}) => {
      store.isVisible = true
      if (target != null) {
        switch (target) {
          case Widget.CLIPBOARD:
            store.showClipboardManager()
            return

          case Widget.SCRATCHPAD:
            store.showScratchpad()
            return

          case Widget.EMOJIS:
            store.showEmojiPicker()
            return

          case Widget.SETTINGS:
            store.showSettings()
            return
        }
        return
      }

      store.getApps()

      setImmediate(() => {
        if (!store.isAccessibilityTrusted) {
          store.getAccessibilityStatus()
        }

        if (!store.hasFullDiskAccess) {
          store.getFullDiskAccessStatus()
        }
      })
    },
    onHide: () => {
      store.isVisible = false
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
      onHotkeyListener?.remove()
      onAppsChangedListener?.remove()
      appareanceListener?.remove()
      bookmarksDisposer?.()
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
      console.warn('SHOW SCRATCHPAD')
      if (store.focusedWidget === Widget.SCRATCHPAD) {
        store.focusWidget(Widget.SEARCH)
      } else {
        store.focusWidget(Widget.SCRATCHPAD)
      }
    },
    showClipboardManager: () => {
      store.query = ''
      if (store.focusedWidget === Widget.CLIPBOARD) {
        store.focusWidget(Widget.SEARCH)
      } else {
        store.focusWidget(Widget.CLIPBOARD)
      }
    },
    showProcessManager: () => {
      store.query = ''
      store.focusWidget(Widget.PROCESSES)
    },
    onFileSearch: (files: FileDescription[]) => {
      store.fileResults = files
    },
    setCalendarEnabled: (v: boolean) => {
      store.calendarEnabled = v
    },
    setShowAllDayEvents: (v: boolean) => {
      store.showAllDayEvents = v
    },
    setLaunchAtLogin: (v: boolean) => {
      store.launchAtLogin = v
      solNative.setLaunchAtLogin(v)
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
        const safariBookmarksRaw = await solNative.getSafariBookmarks()

        runInAction(() => {
          store.safariBookmarks = safariBookmarksRaw.map(
            (bookmark: any, idx: number): Item => {
              return {
                id: `${bookmark.title}_safari_${idx}`,
                name: bookmark.title,
                type: ItemType.BOOKMARK,
                bookmarkFolder: null,
                faviconFallback: Assets.Safari,
                url: bookmark.url,
                callback: () => {
                  Linking.openURL(bookmark.url)
                },
              }
            },
          )
        })
      }
    },
    getBraveBookmarks: async () => {
      const path = `/Users/${store.username}/Library/Application Support/BraveSoftware/Brave-Browser/Default/Bookmarks`
      const exists = solNative.exists(path)
      if (!exists) {
        return
      }

      const bookmarksString = solNative.readFile(path)
      if (!bookmarksString) {
        return
      }

      const OGbookmarks = JSON.parse(bookmarksString)

      let bookmarks: {
        title: string
        url: string
        bookmarkFolder: null | string
      }[] = []

      traverse(bookmarks, OGbookmarks.roots.bookmark_bar.children, null)

      store.braveBookmarks = bookmarks.map((bookmark, idx): Item => {
        return {
          id: `${bookmark.title}_brave_${idx}`,
          name: bookmark.title,
          bookmarkFolder: bookmark.bookmarkFolder,
          type: ItemType.BOOKMARK,
          faviconFallback: Assets.Brave,
          url: bookmark.url,
          callback: () => {
            try {
              Linking.openURL(bookmark.url)
            } catch (e) {
              // intentionally left blank
            }
          },
        }
      })
    },
    getChromeBookmarks: async () => {
      const username = solNative.userName()
      const path = `/Users/${username}/Library/Application Support/Google/Chrome/Default/Bookmarks`
      const exists = solNative.exists(path)
      if (exists) {
        const bookmarksString = solNative.readFile(path)
        if (!bookmarksString) {
          return
        }
        const OGbookmarks = JSON.parse(bookmarksString)
        let bookmarks: {
          title: string
          url: string
          bookmarkFolder: null | string
        }[] = []

        traverse(bookmarks, OGbookmarks.roots.bookmark_bar.children, null)
        store.chromeBookmarks = bookmarks.map((bookmark, idx): Item => {
          return {
            id: `${bookmark.title}_brave_${idx}`,
            name: bookmark.title,
            bookmarkFolder: bookmark.bookmarkFolder,
            type: ItemType.BOOKMARK,
            faviconFallback: Assets.Chrome,
            url: bookmark.url,
            callback: () => {
              Linking.openURL(bookmark.url)
            },
          }
        })
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
      solNative.restart()
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

    showFileSearch: () => {
      store.focusWidget(Widget.FILE_SEARCH)
      store.query = ''
    },

    addSearchFolder: (folder: string) => {
      store.searchFolders.push(folder)
    },

    removeSearchFolder: (folder: string) => {
      store.searchFolders = store.searchFolders.filter(f => f !== folder)
    },

    setSearchEngine: (engine: SearchEngine) => {
      store.searchEngine = engine
    },

    setCustomSearchUrl: (url: string) => {
      store.customSearchUrl = url
    },

    onHotkey({id}: {id: string}) {
      let item = store.items.find(i => i.id === id)

      if (item == null) {
        return
      }

      if (item.callback) {
        item.callback()
      } else if (item.url) {
        solNative.openFile(item.url)
      }

      if (itemsThatShouldShowWindow.includes(item.id)) {
        setTimeout(solNative.showWindow, 0)
      }
    },

    setShortcut(id: string, shortcut: string) {
      store.shortcuts[id] = shortcut
      solNative.updateHotkeys(toJS(store.shortcuts))
    },

    restoreDefaultShorcuts() {
      store.shortcuts = defaultShortcuts
      solNative.updateHotkeys(toJS(store.shortcuts))
    },

    setWindowHeight(e: any) {
      solNative.setWindowHeight(e.nativeEvent.layout.height)
    },

    setShowInAppBrowserBookmarks: (v: boolean) => {
      store.showInAppBrowserBookMarks = v
    },

    // Old custom items are not migrated to the new format which has an id
    // This function is used to migrate the old custom items to the new format
    // by just adding a random id
    migrateCustomItems() {
      store.customItems = store.customItems.map(i => {
        if (i.id) {
          return i
        }

        return {...i, id: Math.random().toString()}
      })
    },
    setHasDismissedGettingStarted: (v: boolean) => {
      store.hasDismissedGettingStarted = v
    },
    applicationsChanged: () => {
      store.getApps()
    },
    setShowKeyboardRecorderForItem: (show: boolean, itemId: string) => {
      store.showKeyboardRecorder = show
      store.keyboardRecorderSelectedItem = itemId
    },
    setShortcutFromUI: (shortcut: string[]) => {
      setTimeout(() => {
        store.showKeyboardRecorder = false
      }, 1000)

      let itemId = store.keyboardRecorderSelectedItem
      store.keyboardRecorderSelectedItem = null
      if (!itemId) {
        return
      }
      store.setShortcut(itemId, shortcut.join('+'))
    },
    confirm: async (title: string, callback: () => any) => {
      store.confirmDialogShown = true
      store.confirmCallback = callback
      store.confirmTitle = title
    },
    closeConfirm: () => {
      store.confirmDialogShown = false
      store.confirmCallback = null
      store.confirmTitle = null
    },
    executeConfirmCallback: async () => {
      let callback = store.confirmCallback
      store.closeConfirm()
      await callback?.()
    },
  })

  bookmarksDisposer = reaction(
    () => [store.showInAppBrowserBookMarks],
    () => {
      minisearch.removeAll()
    },
  )

  appareanceListener = Appearance.addChangeListener(store.onColorSchemeChange)

  hydrate().then(() => {
    autorun(persist)
    store.getCalendarAccess()
    store.getAccessibilityStatus()
    store.getFullDiskAccessStatus()
  })

  onShowListener = solNative.addListener('onShow', store.onShow)
  onHideListener = solNative.addListener('onHide', store.onHide)
  onHotkeyListener = solNative.addListener('hotkey', store.onHotkey)
  onAppsChangedListener = solNative.addListener(
    'applicationsChanged',
    store.applicationsChanged,
  )
  onFileSearchListener = solNative.addListener(
    'onFileSearch',
    store.onFileSearch,
  )

  return store
}
