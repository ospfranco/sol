import Cocoa
import EventKit
import Foundation
import HotKey
import Sparkle
import SwiftUI

let baseSize = NSSize(width: 750, height: 500)
let handledKeys: [UInt16] = [53, 123, 124, 126, 125, 36, 48]
let numberchars: [String] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

@NSApplicationMain
@objc
class AppDelegate: NSObject, NSApplicationDelegate,
  NSUserNotificationCenterDelegate
{
  private var shiftPressed = false
  private var mainWindow: Panel!
  private var overlayWindow: Overlay!
  private var toastWindow: Toast!
  private var rootView: RCTRootView!
  private var catchHorizontalArrowsPress = false
  private var catchVerticalArrowsPress = true
  private var catchEnterPress = true
  public var useBackgroundOverlay = false
  private var showWindowOn = "windowWithFrontmost"
  public var shouldHideMenuBar = false
  private var mainHotKey = HotKey(key: .space, modifiers: [.command])
  private var updaterController: SPUStandardUpdaterController
  private let topLeftScreenHotKey = HotKey(
    key: .u,
    modifiers: [.option, .control]
  )
  private let topRightScreenHotKey = HotKey(
    key: .i,
    modifiers: [.option, .control]
  )
  private let bottomLeftScreenHotKey = HotKey(
    key: .j,
    modifiers: [.option, .control]
  )
  private let bottomRightScreenHotKey = HotKey(
    key: .k,
    modifiers: [.option, .control]
  )
  private let topSideScreenHotKey = HotKey(
    key: .upArrow,
    modifiers: [.option, .control]
  )
  private let bottomSideScreenHotKey = HotKey(
    key: .downArrow,
    modifiers: [.option, .control]
  )
  private let rightSideScreenHotKey = HotKey(
    key: .rightArrow,
    modifiers: [.option, .control]
  )
  private let leftSideScreenHotKey = HotKey(
    key: .leftArrow,
    modifiers: [.option, .control]
  )
  private let fullScreenHotKey = HotKey(
    key: .return,
    modifiers: [.option, .control]
  )
  private let moveToNextScreenHotKey = HotKey(
    key: .rightArrow,
    modifiers: [.option, .control, .command]
  )
  private let moveToPrevScreenHotKey = HotKey(
    key: .leftArrow,
    modifiers: [.option, .control, .command]
  )
  private var scratchpadHotKey: HotKey?
  private let emojiPickerHotKey = HotKey(
    key: .space,
    modifiers: [.control, .command]
  )
  private var clipboardManagerHotKey: HotKey?
  private let settingsHotKey = HotKey(key: .comma, modifiers: [.command])
  private var statusBarItem: NSStatusItem?
  private var mediaKeyForwarder: MediaKeyForwarder?

  override init() {
    updaterController = SPUStandardUpdaterController(
      startingUpdater: true,
      updaterDelegate: nil,
      userDriverDelegate: nil
    )
  }

  func applicationShouldHandleReopen(_: NSApplication,
                                     hasVisibleWindows _: Bool) -> Bool
  {
    showWindow()
    return true
  }

  func applicationDidFinishLaunching(_: Notification) {
    let jsCodeLocation: URL = RCTBundleURLProvider
      .sharedSettings()
      .jsBundleURL(forBundleRoot: "index")

    rootView = RCTRootView(
      bundleURL: jsCodeLocation,
      moduleName: "sol",
      initialProperties: nil,
      launchOptions: nil
    )

    mainWindow = Panel(
      contentRect: NSRect(x: 0, y: 0, width: 750, height: 500),
      backing: .buffered, defer: false
    )

    mainWindow.contentView = rootView

    let windowRect = NSScreen.main?.frame
    overlayWindow = Overlay(
      contentRect: windowRect!,
      backing: .buffered,
      defer: false
    )

    toastWindow = Toast(
      contentRect: NSRect(x: 0, y: 0, width: 250, height: 30),
      backing: .buffered,
      defer: false
    )

    setupKeyboardListeners()
    setupPasteboardListener()
    setupDisplayConnector()
    mediaKeyForwarder = MediaKeyForwarder()

    DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
      self.showWindow()
    }
  }

  func setupDisplayConnector() {
    handleDisplayConnection(notification: nil)
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleDisplayConnection),
      name: NSApplication.didChangeScreenParametersNotification,
      object: nil
    )
  }

  @objc func handleDisplayConnection(notification _: Notification?) {
    if shouldHideMenuBar {
      NotchHelper.shared.hideNotch()
    }
  }

  func checkForUpdates() {
    updaterController.checkForUpdates(self)
  }

  func setupPasteboardListener() {
    ClipboardHelper.addOnPasteListener {
      let txt = $0.string(forType: .string)
      if txt != nil {
        SolEmitter.sharedInstance.textPasted(txt!, $1?.bundle)
      }
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
    rightSideScreenHotKey
      .keyDownHandler = { WindowManager.sharedInstance.moveHalf(.right) }
    leftSideScreenHotKey
      .keyDownHandler = { WindowManager.sharedInstance.moveHalf(.left) }
    topSideScreenHotKey
      .keyDownHandler = { WindowManager.sharedInstance.moveHalf(.top) }
    bottomSideScreenHotKey
      .keyDownHandler = { WindowManager.sharedInstance.moveHalf(.bottom) }
    fullScreenHotKey.keyDownHandler = WindowManager.sharedInstance.fullscreen
    moveToNextScreenHotKey.keyDownHandler = WindowManager.sharedInstance
      .moveToNextScreen
    moveToPrevScreenHotKey.keyDownHandler = WindowManager.sharedInstance
      .moveToPrevScreen
    topLeftScreenHotKey
      .keyDownHandler = {
        WindowManager.sharedInstance.moveQuarter(.topLeft)
      }
    topRightScreenHotKey
      .keyDownHandler = { WindowManager.sharedInstance.moveQuarter(.topRight) }
    bottomLeftScreenHotKey
      .keyDownHandler = { WindowManager.sharedInstance.moveQuarter(.bottomLeft)
      }
    bottomRightScreenHotKey
      .keyDownHandler = {
        WindowManager.sharedInstance.moveQuarter(.bottomRight)
      }
    scratchpadHotKey?.keyDownHandler = showScratchpad
    emojiPickerHotKey.keyDownHandler = showEmojiPicker
    clipboardManagerHotKey?.keyDownHandler = showClipboardManager
    settingsHotKey.keyDownHandler = showSettings
    mainHotKey.keyDownHandler = toggleWindow

    NSEvent.addLocalMonitorForEvents(matching: .keyDown) {
      //      36 enter
      //      123 arrow left
      //      124 arrow right
      //      125 arrow down
      //      126 arrow up
      if ($0.keyCode == 123 || $0.keyCode == 124) && !self
        .catchHorizontalArrowsPress
      {
        return $0
      }

      if ($0.keyCode == 125 || $0.keyCode == 126) && !self
        .catchVerticalArrowsPress
      {
        return $0
      }

      if $0.keyCode == 36 && !self.catchEnterPress {
        return $0
      }

      let metaPressed = $0.modifierFlags.contains(.command)
      let shiftPressed = $0.modifierFlags.contains(.shift)
      SolEmitter.sharedInstance.keyDown(
        key: $0.characters,
        keyCode: $0.keyCode,
        meta: metaPressed,
        shift: shiftPressed
      )

      if handledKeys.contains($0.keyCode) {
        return nil
      }

      if metaPressed && $0.characters != nil && numberchars
        .contains($0.characters!)
      {
        return nil
      }

      return $0
    }

    NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) {
      if $0.modifierFlags.contains(.command) {
        SolEmitter.sharedInstance.keyDown(
          key: "command",
          keyCode: 55,
          meta: true,
          shift: self.shiftPressed
        )
      } else {
        SolEmitter.sharedInstance.keyUp(
          key: "command",
          keyCode: 55,
          meta: false,
          shift: self.shiftPressed
        )
      }

      if $0.modifierFlags.contains(.shift) {
        self.shiftPressed = true
        SolEmitter.sharedInstance.keyDown(
          key: "shift",
          keyCode: 60,
          meta: false,
          shift: self.shiftPressed
        )
      } else {
        self.shiftPressed = false
        SolEmitter.sharedInstance.keyUp(
          key: "shift",
          keyCode: 60,
          meta: false,
          shift: self.shiftPressed
        )
      }

      return $0
    }
  }

  func toggleWindow() {
    if mainWindow != nil && mainWindow.isVisible {
      hideWindow()
    } else {
      showWindow()
    }
  }

  func triggerOverlay(_ i: Int) {
    if i >= 30 {
      return
    }

    let step = 0.01 // in seconds and opacity

    overlayWindow.alphaValue = step * Double(i)

    DispatchQueue.main.asyncAfter(deadline: .now() + step) {
      self.triggerOverlay(i + 1)
    }
  }

  func getFrontmostScreen() -> NSScreen? {
    mainWindow.center()
    return mainWindow.screen ?? NSScreen.main
  }

  func showWindow(target: String? = nil) {
    if useBackgroundOverlay {
      if showWindowOn == "screenWithFrontmost" {
        overlayWindow.setFrame(NSScreen.main!.frame, display: false)
      } else {
        let screen = getScreenWithMouse()
        overlayWindow.setFrame(screen!.frame, display: false)
      }

      overlayWindow.orderFront(nil)

      triggerOverlay(0)
    }

    SolEmitter.sharedInstance.onShow(target: target)

    // Give react native event listener a bit of time to react
    // and switch components
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
      self.settingsHotKey.isPaused = false
      self.mainWindow.setIsVisible(false)
      self.mainWindow.makeKeyAndOrderFront(self)

      guard let screen = (self.showWindowOn == "screenWithFrontmost" ? self
        .getFrontmostScreen() : getScreenWithMouse())
      else {
        return
      }

      let yOffset = screen.visibleFrame.height * 0.3
      let x = screen.visibleFrame.midX - baseSize.width / 2
      let y = screen.visibleFrame.midY - self.mainWindow.frame.height + yOffset
      self.mainWindow.setFrameOrigin(NSPoint(x: floor(x), y: floor(y)))

      self.mainWindow.makeKeyAndOrderFront(self)

      self.mainWindow.setIsVisible(true)
    }
  }

  func showScratchpad() {
    showWindow(target: "SCRATCHPAD")
  }

  func showEmojiPicker() {
    showWindow(target: "EMOJIS")
  }

  func showClipboardManager() {
    showWindow(target: "CLIPBOARD")
  }

  func showSettings() {
    SolEmitter.sharedInstance.onShow(target: "SETTINGS")
  }

  @objc func hideWindow() {
//    #if !DEBUG
    if mainWindow.isVisible {
      overlayWindow.orderOut(self)
      mainWindow.orderOut(self)
      SolEmitter.sharedInstance.onHide()
      settingsHotKey.isPaused = true
    }
//    #endif
  }

  func setHorizontalArrowCatch(catchHorizontalArrowPress: Bool) {
    catchHorizontalArrowsPress = catchHorizontalArrowPress
  }

  func setVerticalArrowCatch(catchVerticalArrowPress: Bool) {
    catchVerticalArrowsPress = catchVerticalArrowPress
  }

  func setEnterCatch(catchEnter: Bool) {
    catchEnterPress = catchEnter
  }

  func setGlobalShortcut(_ key: String) {
    mainHotKey.isPaused = true
    if key == "command" {
      mainHotKey = HotKey(
        key: .space,
        modifiers: [.command],
        keyDownHandler: toggleWindow
      )
    } else if key == "option" {
      mainHotKey = HotKey(
        key: .space,
        modifiers: [.option],
        keyDownHandler: toggleWindow
      )
    } else if key == "control" {
      mainHotKey = HotKey(
        key: .space,
        modifiers: [.control],
        keyDownHandler: toggleWindow
      )
    }
  }

  func setScratchpadShortcut(_ key: String) {
    scratchpadHotKey?.isPaused = true

    if key == "command" {
      scratchpadHotKey = HotKey(
        key: .space,
        modifiers: [.command, .shift],
        keyDownHandler: showScratchpad
      )
    } else if key == "option" {
      scratchpadHotKey = HotKey(
        key: .space,
        modifiers: [.shift, .option],
        keyDownHandler: showScratchpad
      )
    } else {
      scratchpadHotKey = nil
    }
  }

  func setShowWindowOn(_ on: String) {
    showWindowOn = on
  }

  func setClipboardManagerShortcut(_ key: String) {
    clipboardManagerHotKey?.isPaused = true

    if key == "shift" {
      clipboardManagerHotKey = HotKey(
        key: .v,
        modifiers: [.command, .shift],
        keyDownHandler: showClipboardManager
      )
    } else if key == "option" {
      clipboardManagerHotKey = HotKey(
        key: .v,
        modifiers: [.command, .option],
        keyDownHandler: showClipboardManager
      )
    } else {
      clipboardManagerHotKey = nil
    }
  }

  @objc func setHeight(_ height: Int) {
    var finalHeight = height
    if height == 0 {
      finalHeight = 500
    }

    var frame = mainWindow.frame
    let size = NSSize(width: 750, height: finalHeight)
    frame.origin.y += (frame.size.height - CGFloat(finalHeight))
    frame.size = size

    mainWindow.setFrame(frame, display: false)
    rootView.setFrameSize(size)
    rootView.setFrameOrigin(NSPoint(x: 0, y: 0))
  }

  func setRelativeSize(_ proportion: Double) {
    guard let screenSize = NSScreen.main?.frame.size else {
      return
    }

    let origin = CGPoint(x: 0, y: 0)
    let size = CGSize(
      width: screenSize.width * CGFloat(proportion),
      height: screenSize.height * CGFloat(proportion)
    )

    let frame = NSRect(origin: origin, size: size)
    mainWindow.setFrame(frame, display: false)
    mainWindow.center()
  }

  @objc func resetSize() {
    let origin = CGPoint(x: 0, y: 0)
    let size = baseSize
    let frame = NSRect(origin: origin, size: size)
    mainWindow.setFrame(frame, display: false)
    mainWindow.center()
  }

  func setWindowManagementShortcuts(_ on: Bool) {
    if on {
      rightSideScreenHotKey.isPaused = false
      leftSideScreenHotKey.isPaused = false
      topSideScreenHotKey.isPaused = false
      bottomSideScreenHotKey.isPaused = false
      fullScreenHotKey.isPaused = false
      moveToNextScreenHotKey.isPaused = false
      moveToPrevScreenHotKey.isPaused = false
      topLeftScreenHotKey.isPaused = false
      topRightScreenHotKey.isPaused = false
      bottomLeftScreenHotKey.isPaused = false
      bottomRightScreenHotKey.isPaused = false
    } else {
      rightSideScreenHotKey.isPaused = true
      leftSideScreenHotKey.isPaused = true
      topSideScreenHotKey.isPaused = true
      bottomSideScreenHotKey.isPaused = true
      fullScreenHotKey.isPaused = true
      moveToNextScreenHotKey.isPaused = true
      moveToPrevScreenHotKey.isPaused = true
      topLeftScreenHotKey.isPaused = true
      topRightScreenHotKey.isPaused = true
      bottomLeftScreenHotKey.isPaused = true
      bottomRightScreenHotKey.isPaused = true
    }
  }

  func showToast(_ text: String) {
    toastWindow.center()
    guard let mainScreen = showWindowOn == "screenWithFrontmost" ? toastWindow
      .screen : getScreenWithMouse()
    else {
      return
    }

    toastWindow.setFrameOrigin(NSPoint(
      x: toastWindow.frame.origin.x,
      y: mainScreen.frame.origin.y + mainScreen.frame.size.height * 0.1
    ))
    toastWindow.makeKeyAndOrderFront(nil)

    let toastView = ToastView(text: text)

    let rootView = NSHostingView(rootView: toastView)

    toastWindow.contentView = rootView

    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
      self.toastWindow.orderOut(nil)
    }
  }

  func quit() {
    NSApplication.shared.terminate(self)
  }

  private func applicationShouldHandleReopen(
    _: NSApplication,
    hasVisibleWindows _: Bool
  ) {
    showWindow()
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
