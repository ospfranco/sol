import Foundation
import LaunchAtLogin

@objc(SolNative)
class SolNative: RCTEventEmitter {
  let appDelegate = NSApp.delegate as? AppDelegate

  override init() {
    super.init()
    SolEmitter.sharedInstance.registerEmitter(emitter: self)
  }

  @objc override func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "accentColor": NSColor.controlAccentColor.usingColorSpace(.sRGB)!.hexString
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
    self.sendEvent(withName: "keyDown", body: [
      "key": characters
    ])
  }

  @objc override func supportedEvents() -> [String]? {
    return [
      "keyDown",
      "keyUp",
      "onShow",
      "onHide",
      "onTextPasted"
    ]
  }

  @objc func getNextEvents(
    _ query: String?,
    resolver resolve: @escaping  RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    resolve(CalendarHelper.sharedInstance.getNextEvents(query))
  }

  @objc func hideWindow() {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      appDelegate?.hideWindow()
    }
  }

  @objc func getApps(_ resolve: @escaping  RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    let searcher = ApplicationSearcher()
    let apps = searcher.getAllApplications()
    let res = apps.map { app in
      
      app.url
    }

    resolve(res)
  }

  @objc func openFile(_ path: String) {
    NSWorkspace.shared.openFile(path)
  }

  @objc func openWithFinder(_ path: String) {
    NSWorkspace.shared.openFile(path, withApplication: "Finder")
  }

  @objc func toggleDarkMode() {
    DarkMode.isEnabled = !DarkMode.isEnabled
  }

  @objc func executeAppleScript(_ source: String) {
    AppleScriptHelper.runAppleScript(source)
  }

  @objc func getMediaInfo(_ resolve: @escaping  RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {

    MediaHelper.getCurrentMedia(callback: { information in
      let pathUrl = NSWorkspace.shared.urlForApplication(withBundleIdentifier: information["bundleIdentifier"]! as! String)?.path
      let imageData = information["kMRMediaRemoteNowPlayingInfoArtworkData"] as? Data

      if(imageData == nil) {
        resolve([
          "title": information["kMRMediaRemoteNowPlayingInfoTitle"],
          "artist": information["kMRMediaRemoteNowPlayingInfoArtist"],
          "bundleIdentifier": information["bundleIdentifier"],
          "url": pathUrl
        ])
      } else {
        let bitmap = NSBitmapImageRep(data: imageData!)
        let data = bitmap?.representation(using: .jpeg, properties: [:])
        let base64 = data != nil ? "data:image/jpeg;base64," + data!.base64EncodedString() : nil
        resolve([
          "title": information["kMRMediaRemoteNowPlayingInfoTitle"],
          "artist": information["kMRMediaRemoteNowPlayingInfoArtist"],
          "artwork": base64,
          "bundleIdentifier": information["bundleIdentifier"],
          "url": pathUrl
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

  @objc func getCalendarAuthorizationStatus(
    _ resolve: @escaping  RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    resolve(CalendarHelper.sharedInstance.getCalendarAuthorizationStatus())
  }

  @objc func requestCalendarAccess(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    CalendarHelper.sharedInstance.requestCalendarAccess({
      resolve(nil)
    })
  }

  @objc func getAccessibilityStatus(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    resolve(AXIsProcessTrusted())
  }

  @objc func requestAccessibilityAccess(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock) {
      let options: NSDictionary = [
        kAXTrustedCheckOptionPrompt.takeRetainedValue() as NSString: true
      ]
      let accessibilityEnabled = AXIsProcessTrustedWithOptions(options)
      resolve(accessibilityEnabled)
    }

  @objc func setLaunchAtLogin(_ launchAtLogin: Bool) {
    LaunchAtLogin.isEnabled = launchAtLogin
  }

  @objc func resizeFrontmostRightHalf() {
    WindowManager.sharedInstance.moveRight()
  }

  @objc func resizeFrontmostLeftHalf() {
    WindowManager.sharedInstance.moveLeft()
  }

  @objc func resizeFrontmostFullscreen() {
    WindowManager.sharedInstance.fullscreen()
  }

  @objc func moveFrontmostNextScreen() {
    WindowManager.sharedInstance.moveToNextScreen()
  }

  @objc func moveFrontmostPrevScreen() {
    WindowManager.sharedInstance.moveToPrevScreen()
  }

  @objc func pasteToFrontmostApp(_ content: String) {
    ClipboardHelper.pasteToFrontmostApp(content)
  }

  @objc func insertToFrontmostApp(_ content: String) {
    ClipboardHelper.insertToFrontmostApp(content)
  }

  @objc func turnOnHorizontalArrowsListeners() {
    self.appDelegate?.setHorizontalArrowCatch(catchHorizontalArrowPress: true)
  }

  @objc func turnOffHorizontalArrowsListeners() {
    self.appDelegate?.setHorizontalArrowCatch(catchHorizontalArrowPress: false)
  }

  @objc func turnOnVerticalArrowsListeners() {
    self.appDelegate?.setVerticalArrowCatch(catchVerticalArrowPress: true)
  }

  @objc func turnOffVerticalArrowsListeners() {
    self.appDelegate?.setVerticalArrowCatch(catchVerticalArrowPress: false)
  }

  @objc func turnOffEnterListener() {
    self.appDelegate?.setEnterCatch(catchEnter: false)
  }

  @objc func turnOnEnterListener() {
    self.appDelegate?.setEnterCatch(catchEnter: true)
  }

  @objc func checkForUpdates() {
    self.appDelegate?.checkForUpdates()
  }
}
