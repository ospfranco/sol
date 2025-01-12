import Cocoa
import EventKit
import Foundation
import HotKey
import Sparkle
import SwiftUI

@NSApplicationMain
@objc
class AppDelegate: NSObject, NSApplicationDelegate,
  NSUserNotificationCenterDelegate
{
  private var updaterController: SPUStandardUpdaterController
  private var statusBarItem: NSStatusItem?
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

    setupKeyboardListeners()
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

  func setupKeyboardListeners() {
    HotKeyManager.shared.settingsHotKey.keyDownHandler = showSettings
    HotKeyManager.shared.mainHotKey.keyDownHandler = PanelManager.shared.toggle
    HotKeyManager.shared.setupKeyboardListeners()
  }

  func showScratchpad() {
    PanelManager.shared.showWindow(target: "SCRATCHPAD")
  }

  func showEmojiPicker() {
    PanelManager.shared.showWindow(target: "EMOJIS")
  }

  func showClipboardManager() {
    PanelManager.shared.showWindow(target: "CLIPBOARD")
  }

  func showSettings() {
    SolEmitter.sharedInstance.onShow(target: "SETTINGS")
  }

  func quit() {
    NSApplication.shared.terminate(self)
  }

  @objc func statusBarItemCallback(_: AnyObject?) {
    SolEmitter.sharedInstance.onStatusBarItemClick()
  }

  func setStatusBarTitle(_ title: String) {
    if statusBarItem == nil {
      statusBarItem = NSStatusBar.system
        .statusItem(withLength: NSStatusItem.variableLength)
    } else {
      if title.isEmpty {
        NSStatusBar.system.removeStatusItem(statusBarItem!)
        statusBarItem = nil
      } else {
        if let button = statusBarItem?.button {
          button.title = title
          button.action = #selector(statusBarItemCallback(_:))
          button.sizeToFit()
        }
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
