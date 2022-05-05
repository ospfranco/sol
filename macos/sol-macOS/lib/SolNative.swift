import Foundation
import LaunchAtLogin

@objc(SolNative)
class SolNative: RCTEventEmitter {

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
      "onHide"
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
      //      let bitmap: NSBitmapImageRep = NSBitmapImageRep(
      //    data: information["kMRMediaRemoteNowPlayingInfoArtworkData"] as! Data)!
      //      let data = bitmap.representation(using: .jpeg, properties: [:])
      //      let base64 = "data:image/jpeg;base64," + data!.base64EncodedString()

      resolve([
        "title": information["kMRMediaRemoteNowPlayingInfoTitle"],
        "artist": information["kMRMediaRemoteNowPlayingInfoArtist"]
        //        "artwork": base64
      ])
    })
  }

  @objc func setGlobalShortcut(_ key: String) {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      appDelegate?.setGlobalShortcut(key)
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
}
