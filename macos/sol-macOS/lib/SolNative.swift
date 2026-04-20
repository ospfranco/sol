import Foundation
import HotKey
import LaunchAtLogin

private let keychain = Keychain(service: "Sol")

@objc(SolNative)
class SolNative: RCTEventEmitter {
  private func withAppDelegate(_ action: @escaping (AppDelegate) -> Void) {
    DispatchQueue.main.async {
      guard let delegate = NSApp.delegate as? AppDelegate else {
        return
      }
      action(delegate)
    }
  }

  override init() {
    super.init()
    SolEmitter.sharedInstance.registerEmitter(emitter: self)
    ApplicationSearcher.shared.onApplicationsChanged = {
      self.sendEvent(
        withName: "applicationsChanged",
        body: [])
    }
    NSLog("Finished init!")
  }

  @objc override func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "accentColor": NSColor.controlAccentColor.usingColorSpace(.sRGB)!
        .hexString,
      "OSVersion": ProcessInfo.processInfo.operatingSystemVersion.majorVersion,
    ]
  }

  @objc override func startObserving() {
    SolEmitter.sharedInstance.hasListeners = true
  }

  @objc override func stopObserving() {
    SolEmitter.sharedInstance.hasListeners = false
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  func sendKeyDown(characters: String) {
    sendEvent(
      withName: "keyDown",
      body: [
        "key": characters
      ])
  }

  @objc override func supportedEvents() -> [String]? {
    return [
      "keyDown",
      "keyUp",
      "onShow",
      "onHide",
      "onTextCopied",
      "onFileCopied",
      "onFileSearch",
      "onStatusBarItemClick",
      "hotkey",
      "applicationsChanged",
    ]
  }

  @objc func getApps(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling getApps")
    let apps = ApplicationSearcher.shared.getAllApplications()
    resolve(apps)
  }

  @objc func openFile(_ path: String) {
    NSLog("[Sol] Calling openFile")
    // This is deprecated but it opens the apps with a single line of code
    NSWorkspace.shared.openFile(path)
  }

  @objc func openWithFinder(_ path: String) {
    NSLog("[Sol] Calling openWithFinder")
    guard let URL = URL(string: path) else {
      return
    }

    let configuration = NSWorkspace.OpenConfiguration()
    configuration.promptsUserIfNeeded = true

    let finder = NSWorkspace.shared
      .urlForApplication(withBundleIdentifier: "com.apple.finder")
    NSWorkspace.shared.open(
      [URL],
      withApplicationAt: finder!,
      configuration: configuration
    )
  }

  @objc func toggleDarkMode() {
    NSLog("[Sol] Calling toggleDarkMode")
    DarkMode.isEnabled = !DarkMode.isEnabled
  }

  @objc func executeAppleScript(
    _ source: String, resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling executeAppleScript")
    let error = AppleScriptHelper.runAppleScript(source)
    if error == nil {
      resolve(nil)
    } else {
      reject(
        "AppleScriptError",
        error!["NSAppleScriptErrorMessage"] as? String,
        nil
      )
    }
  }

  @objc func executeBashScript(
    _ source: String,
    resolver: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling executeBashScript")
    ShellHelper.shWithFloatingPanel(source)
    resolver(nil)
  }

  @objc func getMediaInfo(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling getMediaInfo")
    MediaHelper.getCurrentMedia(callback: { information in
      let pathUrl = NSWorkspace.shared
        .urlForApplication(
          withBundleIdentifier: information["bundleIdentifier"]! as! String
        )?
        .path
      let imageData =
        information["kMRMediaRemoteNowPlayingInfoArtworkData"] as? Data

      if imageData == nil {
        resolve([
          "title": information["kMRMediaRemoteNowPlayingInfoTitle"],
          "artist": information["kMRMediaRemoteNowPlayingInfoArtist"],
          "bundleIdentifier": information["bundleIdentifier"],
          "url": pathUrl,
        ])
      } else {
        let bitmap = NSBitmapImageRep(data: imageData!)
        let data = bitmap?.representation(using: .jpeg, properties: [:])
        let base64 =
          data != nil
          ? "data:image/jpeg;base64,"
            + data!
            .base64EncodedString() : nil
        resolve([
          "title": information["kMRMediaRemoteNowPlayingInfoTitle"],
          "artist": information["kMRMediaRemoteNowPlayingInfoArtist"],
          "artwork": base64,
          "bundleIdentifier": information["bundleIdentifier"],
          "url": pathUrl,
        ])
      }

    })
  }

  @objc func setGlobalShortcut(_ key: String) {
    NSLog("[Sol] Calling setGlobalShortcut")
    HotKeyManager.shared.mainHotKey.isPaused = true
    if key == "command" {
      HotKeyManager.shared.mainHotKey = HotKey(
        key: .space,
        modifiers: [.command],
        keyDownHandler: PanelManager.shared.toggle
      )
    } else if key == "option" {
      HotKeyManager.shared.mainHotKey = HotKey(
        key: .space,
        modifiers: [.option],
        keyDownHandler: PanelManager.shared.toggle
      )
    } else if key == "control" {
      HotKeyManager.shared.mainHotKey = HotKey(
        key: .space,
        modifiers: [.control],
        keyDownHandler: PanelManager.shared.toggle
      )
    }
  }

  @objc func getAccessibilityStatus(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling getAccessibilityStatus")
    resolve(AXIsProcessTrusted())
  }

  @objc func requestAccessibilityAccess(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling requestAccessibilityAccess")
    let options: NSDictionary = [
      kAXTrustedCheckOptionPrompt.takeRetainedValue() as NSString: true
    ]
    let accessibilityEnabled = AXIsProcessTrustedWithOptions(options)
    resolve(accessibilityEnabled)
  }

  @objc func setLaunchAtLogin(_ enabled: Bool) {
    NSLog("[Sol] Calling setLaunchAtLogin")
    if LaunchAtLogin.isEnabled != enabled {
      LaunchAtLogin.isEnabled = enabled
    }
  }

  @objc func resizeFrontmostTopHalf() {
    NSLog("[Sol] Calling resizeFrontmostTopHalf")
    WindowManager.sharedInstance.moveHalf(.top)
  }

  @objc func resizeFrontmostBottomHalf() {
    NSLog("[Sol] Calling resizeFrontmostBottomHalf")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveHalf(.bottom) }
  }

  @objc func resizeFrontmostRightHalf() {
    NSLog("[Sol] Calling resizeFrontmostRightHalf")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveHalf(.right) }
  }

  @objc func resizeFrontmostLeftHalf() {
    NSLog("[Sol] Calling resizeFrontmostLeftHalf")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveHalf(.left) }
  }

  @objc func resizeFrontmostFullscreen() {
    NSLog("[Sol] Calling resizeFrontmostFullscreen")
    DispatchQueue.main.async { WindowManager.sharedInstance.fullscreen() }
  }

  @objc func resizeTopLeft() {
    NSLog("[Sol] Calling resizeTopLeft")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveQuarter(.topLeft) }
  }

  @objc func resizeTopRight() {
    NSLog("[Sol] Calling resizeTopRight")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveQuarter(.topRight) }
  }

  @objc func resizeBottomLeft() {
    NSLog("[Sol] Calling resizeBottomLeft")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveQuarter(.bottomLeft) }
  }

  @objc func resizeBottomRight() {
    NSLog("[Sol] Calling resizeBottomRight")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveQuarter(.bottomRight) }
  }

  @objc func resizeLeftThird() {
    NSLog("[Sol] Calling resizeLeftThird")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveThird(.left) }
  }

  @objc func resizeCenterThird() {
    NSLog("[Sol] Calling resizeCenterThird")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveThird(.center) }
  }

  @objc func resizeRightThird() {
    NSLog("[Sol] Calling resizeRightThird")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveThird(.right) }
  }

  @objc func resizeLeftTwoThirds() {
    NSLog("[Sol] Calling resizeLeftTwoThirds")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveTwoThirds(.left) }
  }

  @objc func resizeRightTwoThirds() {
    NSLog("[Sol] Calling resizeRightTwoThirds")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveTwoThirds(.right) }
  }

  @objc func moveFrontmostNextScreen() {
    NSLog("[Sol] Calling moveFrontmostNextScreen")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveToNextScreen() }
  }

  @objc func moveFrontmostPrevScreen() {
    NSLog("[Sol] Calling moveFrontmostPrevScreen")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveToPrevScreen() }
  }

  @objc func moveFrontmostCenter() {
    NSLog("[Sol] Calling moveFrontmostCenter")
    DispatchQueue.main.async { WindowManager.sharedInstance.center() }
  }

  @objc func moveFrontmostToNextSpace() {
    NSLog("[Sol] Calling moveFrontmostToNextSpace")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveFrontmostToNextSpace() }
  }

  @objc func moveFrontmostToPreviousSpace() {
    NSLog("[Sol] Calling moveFrontmostToPreviousSpace")
    DispatchQueue.main.async { WindowManager.sharedInstance.moveFrontmostToPreviousSpace() }
  }

  @objc func pasteToFrontmostApp(_ content: String) {
    NSLog("[Sol] Calling pasteToFrontmostApp")
    ClipboardHelper.pasteToFrontmostApp(content)
  }

  @objc func pasteImageToFrontmostApp(_ path: String) {
    NSLog("[Sol] Calling pasteImageToFrontmostApp")
    ClipboardHelper.pasteImageFileToFrontmostApp(path)
  }

  @objc func insertToFrontmostApp(_ content: String) {
    NSLog("[Sol] Calling insertToFrontmostApp")
    ClipboardHelper.insertToFrontmostApp(content)
  }

  @objc func turnOnHorizontalArrowsListeners() {
    NSLog("[Sol] Calling turnOnHorizontalArrowsListeners")
    HotKeyManager.shared.catchHorizontalArrowsPress = true
  }

  @objc func turnOffHorizontalArrowsListeners() {
    NSLog("[Sol] Calling turnOffHorizontalArrowsListeners")
    HotKeyManager.shared.catchHorizontalArrowsPress = false
  }

  @objc func turnOnVerticalArrowsListeners() {
    NSLog("[Sol] Calling turnOnVerticalArrowsListeners")
    HotKeyManager.shared.catchVerticalArrowsPress = true
  }

  @objc func turnOffVerticalArrowsListeners() {
    NSLog("[Sol] Calling turnOffVerticalArrowsListeners")
    HotKeyManager.shared.catchVerticalArrowsPress = false
  }

  @objc func turnOnEnterListener() {
    NSLog("[Sol] Calling turnOnEnterListener")
    HotKeyManager.shared.catchEnterPress = true
  }

  @objc func turnOffEnterListener() {
    NSLog("[Sol] Calling turnOffEnterListener")
    HotKeyManager.shared.catchEnterPress = false
  }

  @objc func checkForUpdates() {
    NSLog("[Sol] Calling checkForUpdates")
    withAppDelegate { appDelegate in
      appDelegate.checkForUpdates()
    }
  }

  @objc func setWindowRelativeSize(_ relative: NSNumber) {
    NSLog("[Sol] Calling setWindowRelativeSize")
    DispatchQueue.main.async {
      PanelManager.shared.setRelativeSize(relative as! Double)
    }
  }

  @objc func openFinderAt(_ path: String) {
    NSLog("[Sol] Calling openFinderAt")
    NSWorkspace.shared.selectFile(nil, inFileViewerRootedAtPath: path)
  }

  @objc func setShowWindowOn(_ on: String) {
    NSLog("[Sol] Calling setShowWindowOn")
    switch on {
    case "screenWithFrontmost":
      PanelManager.shared.setPreferredScreen(.frontmost)
      break
    default:
      PanelManager.shared.setPreferredScreen(.withMouse)
      break
    }
  }

  @objc func toggleDND() {
    NSLog("[Sol] Calling toggleDND")
    DoNotDisturb.toggle()
  }

  @objc func securelyStore(
    _ key: NSString,
    payload: NSString,
    resolver: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling securelyStore")
    keychain[key as String] = payload as String
    resolver(true)
  }

  @objc func securelyRetrieve(
    _ key: NSString,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling securelyRetrieve")
    let value = keychain[key as String]
    return resolve(value)
  }

  @objc func showToast(_ text: String, variant: String, timeout: NSNumber) {
    NSLog("[Sol] Calling showToast")
    DispatchQueue.main.async {
      ToastManager.shared.showToast(
        text, variant: variant, timeout: timeout, image: nil)
    }
  }

  @objc func useBackgroundOverlay(_ v: Bool) {
    NSLog("[Sol] Calling useBackgroundOverlay")
    //    appDelegate?.useBackgroundOverlay = v
  }

  @objc func hideNotch() {
    NSLog("[Sol] Calling hideNotch")
    NotchHelper.shared.hideNotch()
  }

  @objc func showWifiQR(_ SSID: String, password: String) {
    NSLog("[Sol] Calling showWifiQR")
    let image = WifiQR(name: SSID, password: password)
    DispatchQueue.main.async {
      let wifiInfo = "SSID: \(SSID)\nPassword: \(password)"
      ToastManager.shared.showToast(
        wifiInfo, variant: "none", timeout: 30, image: image)
    }
  }

  @objc func hasFullDiskAccess(
    _ resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling hasFullDiskAccess")
    resolve(BookmarkHelper.hasFullDiskAccess())
  }

  @objc func getSafariBookmarks(
    _ resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling getSafariBookmarks")
    let bookmarks = BookmarkHelper.getSafariBookmars()
    resolve(bookmarks)
  }

  @objc func quit() {
    NSLog("[Sol] Calling quit")
    DispatchQueue.main.async {
      NSApplication.shared.terminate(self)
    }
  }

  @objc func setStatusBarItemTitle(_ title: String) {
    NSLog("[Sol] Calling setStatusBarItemTitle")
    StatusBarItemManager.shared.setStatusBarTitle(title)
  }

  @objc func setMediaKeyForwardingEnabled(_ v: Bool) {
    NSLog("[Sol] Calling setMediaKeyForwardingEnabled")
    withAppDelegate { appDelegate in
      appDelegate.setMediaKeyForwardingEnabled(v)
    }
  }

  @objc func openFilePicker(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    NSLog("[Sol] Calling openFilePicker")
    DispatchQueue.main.async {
      let panel = NSOpenPanel()
      panel.allowsMultipleSelection = false
      panel.canChooseDirectories = true
      panel.canChooseFiles = false
      if panel.runModal() == .OK {
        let fileName = panel.url?.absoluteString
        resolve(fileName)
      } else {
        reject(nil, nil, nil)
      }
    }
  }

  @objc func updateHotkeys(_ hotkeys: NSDictionary) {
    NSLog("[Sol] Calling updateHotkeys")
    guard let hotkeys = hotkeys as? [String: String] else { return }
    HotKeyManager.shared.updateHotkeys(hotkeyMap: hotkeys)
  }

  @objc func setUpcomingEventEnabled(_ enabled: Bool) {
    NSLog("[Sol] Calling setUpcomingEventEnabled")
    StatusBarCalendarManager.shared.enabled = enabled
  }

  @objc func setHyperKeyEnabled(_ enabled: Bool) {
    NSLog("[Sol] Calling setHyperKeyEnabled")
    if enabled {
      DispatchQueue.main.async {
        HotKeyManager.shared.setupCapsLockMonitoring()
      }
    } else {
      DispatchQueue.main.async {

        HotKeyManager.shared.resetCapsLockMonitoring()
      }
    }
  }

}
