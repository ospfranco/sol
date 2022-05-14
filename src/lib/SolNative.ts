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
  hideWindow: () => void
  getNextEvents: (query?: string) => Promise<INativeEvent[]>
  getApps: () => Promise<string[]>
  toggleDarkMode: () => void
  executeAppleScript: (source: string) => void
  getMediaInfo: () => Promise<
    {title: string; artist: string; artwork: string} | null | undefined
  >
  setGlobalShortcut: (key: 'command' | 'option') => void
  getCalendarAuthorizationStatus: () => Promise<CalendarAuthorizationStatus>
  requestCalendarAccess: () => Promise<void>
  requestAccessibilityAccess: () => Promise<void>
  setLaunchAtLogin: (v: boolean) => void
  getAccessibilityStatus: () => Promise<boolean>
  resizeFrontmostRightHalf: () => void
  resizeFrontmostLeftHalf: () => void
  resizeFrontmostFullscreen: () => void
  moveFrontmostNextScreen: () => void
  moveFrontmostPrevScreen: () => void
  pasteToFrontmostApp: (content: string) => void
  insertToFrontmostApp: (content: string) => void
  accentColor: string
  turnOnHorizontalArrowListeners: () => void
  turnOffHorizontalArrowListeners: () => void
  turnOnVerticalArrowsListeners: () => void
  turnOffVerticalArrowsListeners: () => void

  constructor(module: any) {
    super(module)

    this.getNextEvents = module.getNextEvents
    this.hideWindow = module.hideWindow
    this.getApps = module.getApps
    this.openFile = module.openFile
    this.toggleDarkMode = module.toggleDarkMode
    this.executeAppleScript = module.executeAppleScript
    this.openWithFinder = module.openWithFinder
    this.getMediaInfo = module.getMediaInfo
    this.setGlobalShortcut = module.setGlobalShortcut
    this.getCalendarAuthorizationStatus = module.getCalendarAuthorizationStatus
    this.requestAccessibilityAccess = module.requestAccessibilityAccess
    this.requestCalendarAccess = module.requestCalendarAccess
    this.setLaunchAtLogin = module.setLaunchAtLogin
    this.getAccessibilityStatus = module.getAccessibilityStatus
    this.resizeFrontmostRightHalf = module.resizeFrontmostRightHalf
    this.resizeFrontmostFullscreen = module.resizeFrontmostFullscreen
    this.resizeFrontmostFullscreen = module.resizeFrontmostFullscreen
    this.moveFrontmostNextScreen = module.moveFrontmostNextScreen
    this.moveFrontmostNextScreen = module.moveFrontmostNextScreen
    this.moveFrontmostPrevScreen = module.moveFrontmostPrevScreen
    this.resizeFrontmostLeftHalf = module.resizeFrontmostLeftHalf
    this.pasteToFrontmostApp = module.pasteToFrontmostApp
    this.insertToFrontmostApp = module.insertToFrontmostApp
    this.turnOnHorizontalArrowListeners = module.turnOnHorizontalArrowListeners
    this.turnOffHorizontalArrowListeners =
      module.turnOffHorizontalArrowListeners
    this.turnOnVerticalArrowsListeners = module.turnOnVerticalArrowsListeners
    this.turnOffVerticalArrowsListeners = module.turnOffVerticalArrowsListeners

    const constants = module.getConstants()
    this.accentColor = constants.accentColor
  }
}

export const solNative = new SolNative(NativeModules.SolNative)
