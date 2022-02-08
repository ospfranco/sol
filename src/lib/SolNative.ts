import {NativeEventEmitter, NativeModules} from 'react-native'

class SolNative extends NativeEventEmitter {
  openFile: (path: string) => void
  hideWindow: () => void
  getNextEvents: () => Promise<
    {
      title?: string
      url?: string
      date: string
      isAllDay: boolean
      notes: string
      color: string
      location: string
    }[]
  >
  getApps: () => Promise<string[]>
  toggleDarkMode: () => void

  constructor(nativeModule: any) {
    super(nativeModule)

    this.getNextEvents = nativeModule.getNextEvents
    this.hideWindow = nativeModule.hideWindow
    this.getApps = nativeModule.getApps
    this.openFile = nativeModule.openFile
    this.toggleDarkMode = nativeModule.toggleDarkMode
  }
}

export const solNative = new SolNative(NativeModules.SolNative)
