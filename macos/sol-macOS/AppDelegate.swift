import EventKit
import Foundation
import Sparkle

@NSApplicationMain
@objc
class AppDelegate: NSObject, NSApplicationDelegate,
  NSUserNotificationCenterDelegate
{
  private var updaterController: SPUStandardUpdaterController
  private var mediaKeyForwarder: MediaKeyForwarder!

  override init() {
    updaterController = SPUStandardUpdaterController(
      startingUpdater: true,
      updaterDelegate: nil,
      userDriverDelegate: nil
    )
  }

  func applicationShouldHandleReopen(
    _: NSApplication,
    hasVisibleWindows _: Bool
  ) -> Bool {
    PanelManager.shared.showWindow()
    return true
  }

  func applicationDidFinishLaunching(_: Notification) {
    #if DEBUG
      let jsCodeLocation: URL =
        RCTBundleURLProvider
        .sharedSettings()
        .jsBundleURL(forBundleRoot: "index")
    #else
      let jsCodeLocation = Bundle.main.url(
        forResource: "main",
        withExtension: "jsbundle"
      )!
    #endif
    
    
    let rootView = RCTRootView(
      bundleURL: jsCodeLocation,
      moduleName: "sol",
      initialProperties: nil,
      launchOptions: nil
    )

    PanelManager.shared.setRootView(rootView: rootView)

    HotKeyManager.shared.setupKeyboardListeners()
    setupPasteboardListener()
    
    mediaKeyForwarder = MediaKeyForwarder()

    PanelManager.shared.showWindow()
  }

  func checkForUpdates() {
    DispatchQueue.main.async {
      self.updaterController.checkForUpdates(self)
    }
  }

  func setupPasteboardListener() {
    ClipboardHelper.onCopyListener {
      let txt = $0.string(forType: .string)
      let bundle = $1?.bundle
      guard let txt else { return }

      SolEmitter.sharedInstance.textCopied(txt, bundle)

      //      let url = $0.string(forType: .URL)
      //      if url != nil {
      //        handlePastedText(url!, fileExtension: "url")
      //      }
      //      let html = $0.string(forType: .html)
      //      if html != nil {
      //        handlePastedText(html!, fileExtension: "html")
      //      }
    }
  }

  func setMediaKeyForwardingEnabled(_ enabled: Bool) {
    if enabled {
      mediaKeyForwarder?.startEventSession()
    } else {
      mediaKeyForwarder?.stopEventSession()
    }
  }

}
