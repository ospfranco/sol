import {NativeEventEmitter, NativeModules} from 'react-native'

class SolNative extends NativeEventEmitter {
  openFile: (path: string) => void
  openWithFinder: (path: string) => void
  hideWindow: typeof global.__SolProxy.hideWindow
  getEvents: typeof global.__SolProxy.getEvents
  getApps: () => Promise<Array<{name: string; url: string; isRunning: boolean}>>
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
  setGlobalShortcut: (key: 'command' | 'option' | 'control') => void
  getCalendarAuthorizationStatus: typeof global.__SolProxy.getCalendarAuthorizationStatus
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
  moveFrontmostCenter: () => void
  moveFrontmostToNextSpace: () => void
  pasteToFrontmostApp: (content: string) => void
  insertToFrontmostApp: (content: string) => void

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
  useBackgroundOverlay: (v: boolean) => void
  toggleDND: () => void
  securelyStore: (key: string, value: string) => Promise<void>
  securelyRetrieve: (key: string) => Promise<string | null>
  executeBashScript: (script: string) => Promise<void>
  showToast: (
    text: string,
    variant: 'success' | 'error',
    timeout?: number,
  ) => Promise<void>
  ls: typeof global.__SolProxy.ls
  exists: typeof global.__SolProxy.exists
  readFile: typeof global.__SolProxy.readFile
  userName: typeof global.__SolProxy.userName
  ps: typeof global.__SolProxy.ps
  killProcess: typeof global.__SolProxy.killProcess
  hideNotch: () => void
  hasFullDiskAccess: () => Promise<boolean>
  getSafariBookmarks: () => Promise<any>
  quit: () => void
  setStatusBarItemTitle: (title: string) => void
  setMediaKeyForwardingEnabled: (enabled: boolean) => Promise<void>
  getWifiPassword: typeof global.__SolProxy.getWifiPassword
  getWifiInfo: typeof global.__SolProxy.getWifiInfo
  restart: () => void
  openFilePicker: () => Promise<string | null>
  showWindow: typeof global.__SolProxy.showWindow
  showWifiQR: (ssid: string, password: string) => void
  updateHotkeys: (v: Record<string, string>) => void

  // Constants
  accentColor: string
  OSVersion: number

  constructor(module: any) {
    super(module)

    if (global.__SolProxy == null) {
      const installed = module.install()

      if (!installed || global.__SolProxy == null) {
        throw new Error('Error installing JSI bindings!')
      }
    }

    this.getEvents = global.__SolProxy.getEvents
    this.getApps = module.getApps
    this.openFile = module.openFile
    this.toggleDarkMode = module.toggleDarkMode
    this.executeBashScript = module.executeBashScript
    this.executeAppleScript = module.executeAppleScript
    this.openWithFinder = module.openWithFinder
    this.getMediaInfo = module.getMediaInfo
    this.setGlobalShortcut = module.setGlobalShortcut
    this.getCalendarAuthorizationStatus =
      global.__SolProxy.getCalendarAuthorizationStatus
    this.requestAccessibilityAccess = module.requestAccessibilityAccess
    this.requestCalendarAccess = global.__SolProxy.requestCalendarAccess
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
    this.moveFrontmostCenter = module.moveFrontmostCenter
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
    this.setWindowRelativeSize = module.setWindowRelativeSize
    this.setWindowHeight = module.setWindowHeight
    this.openFinderAt = module.openFinderAt
    this.resizeTopLeft = module.resizeTopLeft
    this.resizeTopRight = module.resizeTopRight
    this.resizeBottomLeft = module.resizeBottomLeft
    this.resizeBottomRight = module.resizeBottomRight
    this.toggleDND = module.toggleDND
    this.searchFiles = global.__SolProxy.searchFiles

    this.setWindowHeight = global.__SolProxy.setHeight
    this.resetWindowSize = global.__SolProxy.resetWindowSize
    this.hideWindow = global.__SolProxy.hideWindow
    this.setShowWindowOn = module.setShowWindowOn
    this.useBackgroundOverlay = module.useBackgroundOverlay

    this.securelyRetrieve = module.securelyRetrieve
    this.securelyStore = module.securelyStore

    this.showToast = (text: string, variant = 'success', timeout = 4) =>
      module.showToast(text, variant, timeout)

    this.ls = global.__SolProxy.ls
    this.exists = global.__SolProxy.exists
    this.readFile = global.__SolProxy.readFile
    this.userName = global.__SolProxy.userName
    this.ps = global.__SolProxy.ps
    this.killProcess = global.__SolProxy.killProcess

    const constants = module.getConstants()

    this.accentColor = constants.accentColor
    this.OSVersion = constants.OSVersion

    this.hideNotch = module.hideNotch
    this.hasFullDiskAccess = module.hasFullDiskAccess
    this.getSafariBookmarks = module.getSafariBookmarks

    this.quit = module.quit

    this.setStatusBarItemTitle = module.setStatusBarItemTitle
    this.setMediaKeyForwardingEnabled = module.setMediaKeyForwardingEnabled
    this.getWifiPassword = global.__SolProxy.getWifiPassword
    this.getWifiInfo = global.__SolProxy.getWifiInfo

    this.restart = module.restart

    this.openFilePicker = module.openFilePicker
    this.showWindow = global.__SolProxy.showWindow

    this.showWifiQR = module.showWifiQR
    this.updateHotkeys = module.updateHotkeys

    this.moveFrontmostToNextSpace = module.moveFrontmostToNextSpace
  }
}

export const solNative = new SolNative(NativeModules.SolNative)
