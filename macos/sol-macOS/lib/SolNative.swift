import Foundation
import LaunchAtLogin

@objc(SolNative)
class SolNative: RCTEventEmitter {

  override init() {
    super.init()
    SolEmitter.sharedInstance.registerEmitter(emitter: self)
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
      appDelegate?.hideWindow(preventStateClear: false)
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

  @objc func setLaunchAtLogin(_ launchAtLogin: Bool) {
    LaunchAtLogin.isEnabled = launchAtLogin
  }

  @objc func importImage(
    _ resolve: @escaping  RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
//      appDelegate?.hideWindow(preventStateClear: true)
      appDelegate?.showPanel()
//      let dialog = NSOpenPanel()
//
//      dialog.level = .floating
//      dialog.title = "Choose an icon file"
//      dialog.allowsMultipleSelection = false
//      dialog.canChooseDirectories = false
//      dialog.canChooseFiles = true
      
//      dialog.makeKeyAndOrderFront(self)
//      dialog.makeFirstResponder(nil)
      // Figure out later how to allow only image files

//      if dialog.runModal() == NSApplication.ModalResponse.OK {
//        let srcURL = dialog.urls[0]
//
//        let destURL = FileConstants.appHomeURL.appendingPathComponent(srcURL.lastPathComponent)
//
//        FileManager.default.secureCopyItem(at: srcURL, to: destURL)
//
////        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { // Change `2.0` to the desired number of seconds.
////          appDelegate?.showWindow()
////        }
//        resolve(destURL.path)
//      }
      resolve(nil)
    }
  }
}
