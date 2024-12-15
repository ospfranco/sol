import Foundation
import KeychainAccess
import LaunchAtLogin

private let keychain = Keychain(service: "Sol")

@objc(SolNative)
class SolNative: RCTEventEmitter {
  let appDelegate = NSApp.delegate as? AppDelegate
  let applicationSearcher = ApplicationSearcher()

  override init() {
    super.init()
    SolEmitter.sharedInstance.registerEmitter(emitter: self)
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
      "onTextPasted",
      "onFileSearch",
      "onStatusBarItemClick",
    ]
  }

  @objc func getApps(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    do {
      
      let apps = try applicationSearcher.getAllApplications()
      let res = apps.map { app in
        [
          "url": app.url,
          "name": app.name,
          "isRunning": app.isRunning,
        ] as [String: Any]
      }
      
      resolve(res)
    } catch {
      reject(error.localizedDescription, error.localizedDescription, nil)
    }
  }

  @objc func openFile(_ path: String) {
    // This is deprecated but it opens the apps with a single line of code
    NSWorkspace.shared.openFile(path)
  }

  @objc func openWithFinder(_ path: String) {
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
    DarkMode.isEnabled = !DarkMode.isEnabled
  }

  @objc func executeAppleScript(_ source: String) {
    AppleScriptHelper.runAppleScript(source)
  }

  @objc func executeBashScript(
    _ source: String,
    resolver: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    let output = ShellHelper.sh(source)
    resolver(output)
  }

  @objc func getMediaInfo(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
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
    DispatchQueue.main.async {
      self.appDelegate?.setGlobalShortcut(key)
    }
  }

  @objc func setScratchpadShortcut(_ key: String) {
    DispatchQueue.main.async {
      self.appDelegate?.setScratchpadShortcut(key)
    }
  }

  @objc func setClipboardManagerShortcut(_ key: String) {
    DispatchQueue.main.async {
      self.appDelegate?.setClipboardManagerShortcut(key)
    }
  }

  @objc func getAccessibilityStatus(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    resolve(AXIsProcessTrusted())
  }

  @objc func requestAccessibilityAccess(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    let options: NSDictionary = [
      kAXTrustedCheckOptionPrompt.takeRetainedValue() as NSString: true
    ]
    let accessibilityEnabled = AXIsProcessTrustedWithOptions(options)
    resolve(accessibilityEnabled)
  }

  @objc func setLaunchAtLogin(_ launchAtLogin: Bool) {
    LaunchAtLogin.isEnabled = launchAtLogin
  }

  @objc func resizeFrontmostTopHalf() {
    WindowManager.sharedInstance.moveHalf(.top)
  }

  @objc func resizeFrontmostBottomHalf() {
    WindowManager.sharedInstance.moveHalf(.bottom)
  }

  @objc func resizeFrontmostRightHalf() {
    WindowManager.sharedInstance.moveHalf(.right)
  }

  @objc func resizeFrontmostLeftHalf() {
    WindowManager.sharedInstance.moveHalf(.left)
  }

  @objc func resizeFrontmostFullscreen() {
    WindowManager.sharedInstance.fullscreen()
  }

  @objc func resizeTopLeft() {
    WindowManager.sharedInstance.moveQuarter(.topLeft)
  }

  @objc func resizeTopRight() {
    WindowManager.sharedInstance.moveQuarter(.topRight)
  }

  @objc func resizeBottomLeft() {
    WindowManager.sharedInstance.moveQuarter(.bottomLeft)
  }

  @objc func resizeBottomRight() {
    WindowManager.sharedInstance.moveQuarter(.bottomRight)
  }

  @objc func moveFrontmostNextScreen() {
    WindowManager.sharedInstance.moveToNextScreen()
  }

  @objc func moveFrontmostPrevScreen() {
    WindowManager.sharedInstance.moveToPrevScreen()
  }
  
  @objc func moveFrontmostCenter() {
    WindowManager.sharedInstance.center()
  }

  @objc func pasteToFrontmostApp(_ content: String) {
    ClipboardHelper.pasteToFrontmostApp(content)
  }

  @objc func insertToFrontmostApp(_ content: String) {
    ClipboardHelper.insertToFrontmostApp(content)
  }

  @objc func turnOnHorizontalArrowsListeners() {
    appDelegate?.setHorizontalArrowCatch(catchHorizontalArrowPress: true)
  }

  @objc func turnOffHorizontalArrowsListeners() {
    appDelegate?.setHorizontalArrowCatch(catchHorizontalArrowPress: false)
  }

  @objc func turnOnVerticalArrowsListeners() {
    appDelegate?.setVerticalArrowCatch(catchVerticalArrowPress: true)
  }

  @objc func turnOffVerticalArrowsListeners() {
    appDelegate?.setVerticalArrowCatch(catchVerticalArrowPress: false)
  }

  @objc func turnOffEnterListener() {
    appDelegate?.setEnterCatch(catchEnter: false)
  }

  @objc func turnOnEnterListener() {
    appDelegate?.setEnterCatch(catchEnter: true)
  }

  @objc func checkForUpdates() {
    appDelegate?.checkForUpdates()
  }

  @objc func setWindowRelativeSize(_ relative: NSNumber) {
    DispatchQueue.main.async {
      self.appDelegate?.setRelativeSize(relative as! Double)
    }
  }

  @objc func openFinderAt(_ path: String) {
    NSWorkspace.shared.selectFile(nil, inFileViewerRootedAtPath: path)
  }

  @objc func setShowWindowOn(_ on: String) {
    appDelegate?.setShowWindowOn(on)
  }

  @objc func setWindowManagement(_ v: Bool) {
    DispatchQueue.main.async {
      self.appDelegate?.setWindowManagementShortcuts(v)
    }
  }

  @objc func toggleDND() {
    DoNotDisturb.toggle()
  }

  @objc func securelyStore(
    _ key: NSString,
    payload: NSString,
    resolver: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    keychain[key as String] = payload as String
    resolver(true)
  }

  @objc func securelyRetrieve(
    _ key: NSString,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    let value = keychain[key as String]
    return resolve(value)
  }

  @objc func showToast(_ text: String, variant: String, timeout: NSNumber) {
    DispatchQueue.main.async {
      self.appDelegate?.showToast(text, variant: variant, timeout: timeout, image: nil)
    }
  }

  @objc func useBackgroundOverlay(_ v: Bool) {
    appDelegate?.useBackgroundOverlay = v
  }

  @objc func shouldHideMenubar(_ v: Bool) {
    appDelegate?.shouldHideMenuBar = v
    if v {
      DispatchQueue.main.async {
        self.appDelegate?.handleDisplayConnection(notification: nil)
      }
    }
  }

  @objc func showWifiQR(_ SSID: String, password: String) {
    let image = WifiQR(name: SSID, password: password)
    DispatchQueue.main.async {
      let wifiInfo = "SSID: \(SSID), Password: \(password)"
      self.appDelegate?.showToast(wifiInfo, variant: "success", timeout: 30, image: image)
    }
  }

  @objc func hasFullDiskAccess(
    _ resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    resolve(BookmarkHelper.hasFullDiskAccess())
  }

  @objc func getSafariBookmarks(
    _ resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    let bookmarks = BookmarkHelper.getSafariBookmars()
    resolve(bookmarks)
  }

  @objc func quit() {
    DispatchQueue.main.async {
      self.appDelegate?.quit()
    }
  }

  @objc func setStatusBarItemTitle(_ title: String) {
    DispatchQueue.main.async {
      self.appDelegate?.setStatusBarTitle(title)
    }
  }

  @objc func setMediaKeyForwardingEnabled(_ v: Bool) {
    DispatchQueue.main.async {
      self.appDelegate?.setMediaKeyForwardingEnabled(v)
    }
  }

  @objc func openFilePicker(
    _ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
  ) {
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

}
