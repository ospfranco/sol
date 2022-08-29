import {NativeEventEmitter, NativeModules} from 'react-native'

export enum CalendarAuthorizationStatus {
  notDetermined = 'notDetermined',
  restricted = 'restricted',
  denied = 'denied',
  authorized = 'authorized',
}
export interface INativeEvent {
  id: string
  title?: string
  url?: string
  date: string
  endDate: string
  isAllDay: boolean
  notes: string
  color: string
  location: string
  status: number // 0 none, 1 confirmed, 2 tentative, 3 cancelled
}

class SolNative extends NativeEventEmitter {
  openFile: (path: string) => void
  openWithFinder: (path: string) => void
  hideWindow: typeof global.__SolProxy.hideWindow
  getNextEvents: (query?: string) => Promise<INativeEvent[]>
  getApps: () => Promise<string[]>
  toggleDarkMode: () => void
  executeAppleScript: (source: string) => void
  getMediaInfo: () => Promise<
    | {
        title: string
        artist: string
        artwork: string
        bundleIdentifier: string
        url: string
      }
    | null
    | undefined
  >
  setGlobalShortcut: (key: 'command' | 'option') => void
  setScratchpadShortcut: (key: 'command' | 'option') => void
  setClipboardManagerShortcut: (key: 'shift' | 'option') => void
  getCalendarAuthorizationStatus: () => Promise<CalendarAuthorizationStatus>
  requestCalendarAccess: () => Promise<void>
  requestAccessibilityAccess: () => Promise<void>
  setLaunchAtLogin: (v: boolean) => void
  getAccessibilityStatus: () => Promise<boolean>
  resizeFrontmostRightHalf: () => void
  resizeFrontmostLeftHalf: () => void
  resizeFrontmostTopHalf: () => void
  resizeFrontmostBottomHalf: () => void
  resizeFrontmostFullscreen: () => void
  moveFrontmostNextScreen: () => void
  moveFrontmostPrevScreen: () => void
  pasteToFrontmostApp: (content: string) => void
  insertToFrontmostApp: (content: string) => void
  accentColor: string
  turnOnHorizontalArrowsListeners: () => void
  turnOffHorizontalArrowsListeners: () => void
  turnOnVerticalArrowsListeners: () => void
  turnOffVerticalArrowsListeners: () => void
  turnOnEnterListener: () => void
  turnOffEnterListener: () => void
  checkForUpdates: () => void
  setWindowRelativeSize: (relativeSize: number) => void
  resetWindowSize: typeof global.__SolProxy.resetWindowSize
  setWindowHeight: typeof global.__SolProxy.setHeight
  openFinderAt: (path: string) => void
  resizeTopLeft: () => void
  resizeTopRight: () => void
  resizeBottomLeft: () => void
  resizeBottomRight: () => void
  searchFiles: typeof global.__SolProxy.searchFiles
  setShowWindowOn: (on: 'screenWithFrontmost' | 'screenWithCursor') => void

  constructor(module: any) {
    super(module)

    if (global.__SolProxy == null) {
      const installed = module.install()

      if (!installed || global.__SolProxy == null) {
        throw new Error('Error installing JSI bindings!')
      }
    }

    this.getNextEvents = module.getNextEvents

    this.getApps = module.getApps
    this.openFile = module.openFile
    this.toggleDarkMode = module.toggleDarkMode
    this.executeAppleScript = module.executeAppleScript
    this.openWithFinder = module.openWithFinder
    this.getMediaInfo = module.getMediaInfo
    this.setGlobalShortcut = module.setGlobalShortcut
    this.setScratchpadShortcut = module.setScratchpadShortcut
    this.getCalendarAuthorizationStatus = module.getCalendarAuthorizationStatus
    this.requestAccessibilityAccess = module.requestAccessibilityAccess
    this.requestCalendarAccess = module.requestCalendarAccess
    this.setLaunchAtLogin = module.setLaunchAtLogin
    this.getAccessibilityStatus = module.getAccessibilityStatus
    this.resizeFrontmostRightHalf = module.resizeFrontmostRightHalf
    this.resizeFrontmostLeftHalf = module.resizeFrontmostLeftHalf
    this.resizeFrontmostTopHalf = module.resizeFrontmostTopHalf
    this.resizeFrontmostBottomHalf = module.resizeFrontmostBottomHalf
    this.resizeFrontmostFullscreen = module.resizeFrontmostFullscreen
    this.moveFrontmostNextScreen = module.moveFrontmostNextScreen
    this.moveFrontmostNextScreen = module.moveFrontmostNextScreen
    this.moveFrontmostPrevScreen = module.moveFrontmostPrevScreen
    this.pasteToFrontmostApp = module.pasteToFrontmostApp
    this.insertToFrontmostApp = module.insertToFrontmostApp
    this.turnOnHorizontalArrowsListeners =
      module.turnOnHorizontalArrowsListeners
    this.turnOffHorizontalArrowsListeners =
      module.turnOffHorizontalArrowsListeners
    this.turnOnVerticalArrowsListeners = module.turnOnVerticalArrowsListeners
    this.turnOffVerticalArrowsListeners = module.turnOffVerticalArrowsListeners
    this.checkForUpdates = module.checkForUpdates
    this.turnOnEnterListener = module.turnOnEnterListener
    this.turnOffEnterListener = module.turnOffEnterListener
    this.setClipboardManagerShortcut = module.setClipboardManagerShortcut
    this.setWindowRelativeSize = module.setWindowRelativeSize
    this.setWindowHeight = module.setWindowHeight
    this.openFinderAt = module.openFinderAt
    this.resizeTopLeft = module.resizeTopLeft
    this.resizeTopRight = module.resizeTopRight
    this.resizeBottomLeft = module.resizeBottomLeft
    this.resizeBottomRight = module.resizeBottomRight
    this.searchFiles = global.__SolProxy.searchFiles

    this.setWindowHeight = global.__SolProxy.setHeight
    this.resetWindowSize = global.__SolProxy.resetWindowSize
    this.hideWindow = global.__SolProxy.hideWindow
    this.setShowWindowOn = module.setShowWindowOn

    const constants = module.getConstants()
    this.accentColor = constants.accentColor
  }
}

export const solNative = new SolNative(NativeModules.SolNative)
