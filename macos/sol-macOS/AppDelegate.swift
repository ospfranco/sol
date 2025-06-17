import EventKit
import Foundation
import React_RCTAppDelegate
import Sparkle

@NSApplicationMain
@objc
class AppDelegate: RCTAppDelegate {
  private var updaterController: SPUStandardUpdaterController!
  private var mediaKeyForwarder: MediaKeyForwarder!

  override init() {
    updaterController = SPUStandardUpdaterController(
      startingUpdater: true,
      updaterDelegate: nil,
      userDriverDelegate: nil
    )
    super.init()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func bridgelessEnabled() -> Bool {
    return false
  }

  override func applicationShouldHandleReopen(
    _: NSApplication,
    hasVisibleWindows _: Bool
  ) -> Bool {
    PanelManager.shared.showWindow()
    return true
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }

  override func customize(_ rootView: RCTRootView) {
    rootView.wantsLayer = true
    rootView.backgroundColor = .clear
    rootView.layer?.backgroundColor = .clear
  }

  override func applicationDidFinishLaunching(_ notification: Notification) {
    self.moduleName = "sol"
    self.initialProps = [:]
    self.automaticallyLoadReactNativeWindow = false
    super.applicationDidFinishLaunching(notification)

    let rootView = self.rootViewFactory().view(withModuleName: "sol")

    PanelManager.shared.setRootView(rootView: rootView as! RCTRootView)

    HotKeyManager.shared.setupKeyboardListeners()
    setupPasteboardListener()

//    mediaKeyForwarder = MediaKeyForwarder()

    PanelManager.shared.showWindow()
  }

  func checkForUpdates() {
    DispatchQueue.main.async {
      self.updaterController.checkForUpdates(self)
    }
  }

  func setupPasteboardListener() {
    ClipboardHelper.addOnCopyListener {
      let bundle = $1?.bundle
      
      let data = $0.data(forType: .fileURL)
      
      if data != nil {
        // Copy the file url to temp directory
        do {
          guard let filename = $0.string(forType: .string) else {
            print("Could not get file name")
            return
          }
          guard let url = URL(
            dataRepresentation: data!,
            relativeTo: nil
          ) else {
            print("COuld not get file url")
            return
          }
          
          let tempFile = NSTemporaryDirectory() + filename
          // Copy the file to the temp dir
          try FS.copyFileFromUrl(url, toPath: tempFile)
          SolEmitter.sharedInstance.fileCopied(filename, tempFile, bundle)
        } catch {
          let errorDesc = error.localizedDescription
          print("Could not copy file to temp folder \(errorDesc)")
        }
        return
      }
      
      // Try to parse first as string
      let txt = $0.string(forType: .string)
      if txt != nil {
        SolEmitter.sharedInstance.textCopied(txt!, bundle)
      }
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
