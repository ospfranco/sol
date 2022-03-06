import {NativeEventEmitter, NativeModules} from 'react-native'

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
  getNextEvents: () => Promise<INativeEvent[]>
  getApps: () => Promise<string[]>
  toggleDarkMode: () => void
  executeAppleScript: (source: string) => void
  getMediaInfo: () => Promise<
    {title: string; artist: string; artwork: string} | null | undefined
  >

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
  }
}

export const solNative = new SolNative(NativeModules.SolNative)
