import Cocoa
import EventKit
import Foundation
import HotKey
import Sparkle
import SwiftUI

let baseSize = NSSize(width: 700, height: 450)
let handledKeys: [UInt16] = [53, 123, 124, 126, 125, 36, 48]
let numberchars: [String] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

@NSApplicationMain
@objc
class AppDelegate: NSObject, NSApplicationDelegate,
  NSUserNotificationCenterDelegate
{
  public var shouldHideMenuBar = false
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

  func setGlobalShortcut(_ key: String) {
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

  func setShowWindowOn(_ on: String) {
    switch on {
      case "screenWithFrontmost":
      PanelManager.shared.setPreferredScreen(.frontmost)
      break
      default:
      PanelManager.shared.setPreferredScreen(.withMouse)
      break
      
    }
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
