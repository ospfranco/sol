import {NativeEventEmitter, NativeModules} from 'react-native'

class SolNative extends NativeEventEmitter {
  openFile: (path: string) => void
  openWithFinder: (path: string) => void
  hideWindow: typeof global.__SolProxy.hideWindow
  getEvents: typeof global.__SolProxy.getEvents
  getApps: () => Promise<Array<{name: string; url: string}>>
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
  setWindowManagement: (v: boolean) => void
  useBackgroundOverlay: (v: boolean) => void
  toggleDND: () => void
  securelyStore: (key: string, value: string) => Promise<void>
  securelyRetrieve: (key: string) => Promise<string | null>
  executeBashScript: (script: string) => Promise<void>
  showToast: (text: string) => Promise<void>
  ls: typeof global.__SolProxy.ls
  exists: typeof global.__SolProxy.exists
  userName: typeof global.__SolProxy.userName
  shouldHideMenubar: (v: boolean) => void

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
    this.setScratchpadShortcut = module.setScratchpadShortcut
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
    this.toggleDND = module.toggleDND
    this.searchFiles = global.__SolProxy.searchFiles

    this.setWindowHeight = global.__SolProxy.setHeight
    this.resetWindowSize = global.__SolProxy.resetWindowSize
    this.hideWindow = global.__SolProxy.hideWindow
    this.setShowWindowOn = module.setShowWindowOn
    this.setWindowManagement = module.setWindowManagement
    this.useBackgroundOverlay = module.useBackgroundOverlay

    this.securelyRetrieve = module.securelyRetrieve
    this.securelyStore = module.securelyStore

    this.showToast = module.showToast

    this.ls = global.__SolProxy.ls
    this.exists = global.__SolProxy.exists
    this.userName = global.__SolProxy.userName

    const constants = module.getConstants()

    this.accentColor = constants.accentColor
    this.OSVersion = constants.OSVersion

    this.shouldHideMenubar = module.shouldHideMenubar
  }
}

export const solNative = new SolNative(NativeModules.SolNative)
