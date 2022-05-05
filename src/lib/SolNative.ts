import {NativeEventEmitter, NativeModules} from 'react-native'

export type CalendarAuthorizationStatus =
  | 'notDetermined'
  | 'restricted'
  | 'denied'
  | 'authorized'

export interface INativeEvent {
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
  setLaunchAtLogin: (v: boolean) => void
  getAccessibilityStatus: () => Promise<boolean>
  resizeFrontmostRightHalf: () => void
  resizeFrontmostLeftHalf: () => void
  resizeFrontmostFullscreen: () => void
  moveFrontmostNextScreen: () => void
  moveFrontmostPrevScreen: () => void
  accentColor: string

  constructor(nativeModule: any) {
    super(nativeModule)

    this.getNextEvents = nativeModule.getNextEvents
    this.hideWindow = nativeModule.hideWindow
    this.getApps = nativeModule.getApps
    this.openFile = nativeModule.openFile
    this.toggleDarkMode = nativeModule.toggleDarkMode
    this.executeAppleScript = nativeModule.executeAppleScript
    this.openWithFinder = nativeModule.openWithFinder
    this.getMediaInfo = nativeModule.getMediaInfo
    this.setGlobalShortcut = nativeModule.setGlobalShortcut
    this.getCalendarAuthorizationStatus =
      nativeModule.getCalendarAuthorizationStatus
    this.setLaunchAtLogin = nativeModule.setLaunchAtLogin
    this.getAccessibilityStatus = nativeModule.getAccessibilityStatus
    this.resizeFrontmostRightHalf = nativeModule.resizeFrontmostRightHalf
    this.resizeFrontmostFullscreen = nativeModule.resizeFrontmostFullscreen
    this.resizeFrontmostFullscreen = nativeModule.resizeFrontmostFullscreen
    this.moveFrontmostNextScreen = nativeModule.moveFrontmostNextScreen
    this.moveFrontmostNextScreen = nativeModule.moveFrontmostNextScreen
    this.moveFrontmostPrevScreen = nativeModule.moveFrontmostPrevScreen
    this.resizeFrontmostLeftHalf = nativeModule.resizeFrontmostLeftHalf

    const constants = NativeModules.SolNative.getConstants()
    this.accentColor = constants.accentColor
  }
}

export const solNative = new SolNative(NativeModules.SolNative)
