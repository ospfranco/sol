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
  private var hotkeys: [HotKey] = []
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

  func applicationShouldHandleReopen(
    _: NSApplication,
    hasVisibleWindows _: Bool
  ) -> Bool {
    showWindow()
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

    rootView = RCTRootView(
      bundleURL: jsCodeLocation,
      moduleName: "sol",
      initialProperties: nil,
      launchOptions: nil
    )

    mainWindow = Panel(
      contentRect: NSRect(
        x: 0,
        y: 0,
        width: baseSize.width,
        height: baseSize.height
      )
    )

    mainWindow.contentView = rootView

    let windowRect = NSScreen.main!.frame
    overlayWindow = Overlay(
      contentRect: windowRect,
      backing: .buffered,
      defer: false
    )

    toastWindow = Toast(contentRect: .zero)

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

  func updateHotkeys(hotkeyMap: [String: String]) {
    hotkeys.forEach { $0.isPaused = true }
    hotkeys.removeAll()

    for (key, value) in hotkeyMap {
      let components = value.split(separator: "+").map { String($0) }
      var modifiers: NSEvent.ModifierFlags = []
      var keyValue: Key?

      for component in components {
        switch component.lowercased() {
        case "command":
          modifiers.insert(.command)
        case "control":
          modifiers.insert(.control)
        case "option":
          modifiers.insert(.option)
        case "shift":
          modifiers.insert(.shift)
        case "space":
          keyValue = .space
        case "up":
          keyValue = .upArrow
        case "down":
          keyValue = .downArrow
        case "left":
          keyValue = .leftArrow
        case "right":
          keyValue = .rightArrow
        case "return":
          keyValue = .return
        default:
          keyValue = Key(string: component)
        }
      }

      guard let finalKey = keyValue else { continue }
      let hotKey = HotKey(key: finalKey, modifiers: modifiers)

      hotKey.keyDownHandler = {
        SolEmitter.sharedInstance.onHotkey(id: key)
      }
      hotkeys.append(hotKey)
    }

  }

  func setupKeyboardListeners() {
    settingsHotKey.keyDownHandler = showSettings
    mainHotKey.keyDownHandler = toggleWindow

    NSEvent.addLocalMonitorForEvents(matching: .keyDown) {
      //      36 enter
      //      123 arrow left
      //      124 arrow right
      //      125 arrow down
      //      126 arrow up
      if ($0.keyCode == 123 || $0.keyCode == 124)
        && !self
          .catchHorizontalArrowsPress
      {
        return $0
      }

      if ($0.keyCode == 125 || $0.keyCode == 126)
        && !self
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

      if metaPressed && $0.characters != nil
        && numberchars
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

    let step = 0.01  // in seconds and opacity

    overlayWindow.alphaValue = step * Double(i)

    DispatchQueue.main.asyncAfter(deadline: .now() + step) {
      self.triggerOverlay(i + 1)
    }
  }

  func getFrontmostScreen() -> NSScreen? {
    mainWindow.center()
    return mainWindow.screen ?? NSScreen.main
  }

  func innerShow() {
    settingsHotKey.isPaused = false
    mainWindow.setIsVisible(false)
    mainWindow.makeKeyAndOrderFront(self)

    guard
      let screen =
        (showWindowOn == "screenWithFrontmost" ? getFrontmostScreen() : getScreenWithMouse())
    else {
      return
    }

    let yOffset = screen.visibleFrame.height * 0.3
    let x = screen.visibleFrame.midX - baseSize.width / 2
    let y = screen.visibleFrame.midY - mainWindow.frame.height + yOffset
    mainWindow.setFrameOrigin(NSPoint(x: floor(x), y: floor(y)))

    mainWindow.makeKeyAndOrderFront(self)

    mainWindow.setIsVisible(true)
  }

  @objc func showWindow(target: String? = nil) {
    if useBackgroundOverlay {
      if showWindowOn == "screenWithFrontmost" {
        overlayWindow.setFrame(NSScreen.main!.frame, display: true)
      } else {
        let screen = getScreenWithMouse()
        overlayWindow.setFrame(screen!.frame, display: true)
      }

      overlayWindow.orderFront(nil)

      triggerOverlay(0)
    }

    // Give react native event listener a bit of time to react
    // and switch components
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
      self.innerShow()
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

  func setShowWindowOn(_ on: String) {
    showWindowOn = on
  }

  @objc func setHeight(_ height: Int) {
    var finalHeight = height
    if height == 0 {
      finalHeight = Int(baseSize.height)
    }

    let size = NSSize(width: Int(baseSize.width), height: finalHeight)
    guard
      let screen =
        (showWindowOn == "screenWithFrontmost" ? getFrontmostScreen() : getScreenWithMouse())
    else {
      return
    }

    let yOffset = screen.visibleFrame.height * 0.3
    let y = screen.visibleFrame.midY - CGFloat(finalHeight) + yOffset

    let frame = NSRect(
      x: mainWindow.frame.minX, y: y, width: baseSize.width, height: CGFloat(finalHeight))
    self.mainWindow.setFrame(frame, display: true)

    self.rootView.setFrameSize(size)

    self.rootView.setFrameOrigin(NSPoint(x: 0, y: 0))

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

  func showToast(_ text: String, variant: String, timeout: NSNumber?, image: NSImage?) {
    let showInFrontmost = showWindowOn == "screenWithFrontmost"
    guard let mainScreen = showInFrontmost ? getFrontmostScreen() : getScreenWithMouse()
    else {
      return
    }

    let variantEnum: ToastVariant =
      switch variant {
      case "error": .error
      case "success": .success
      default: .none
      }

    let toastView = ToastView(
      text: text,
      variant: variantEnum,
      image: image,
      dismissCallback: {
        DispatchQueue.main.async {
          self.dismissToast()
        }
      }
    )
    toastView.layoutSubtreeIfNeeded()  // Ensure layout is performed

    let contentSize = toastView.intrinsicContentSize
    toastView.frame = NSRect(x: 0, y: 0, width: contentSize.width, height: contentSize.height)

    let effectView = NSVisualEffectView(
      frame: NSRect(x: 0, y: 0, width: contentSize.width, height: contentSize.height)
    )
    effectView.autoresizingMask = [.width, .height]
    effectView.material = .hudWindow  // Or other material
    effectView.blendingMode = .behindWindow
    effectView.state = .active

    toastWindow.contentView = effectView
    toastWindow.contentView!.addSubview(toastView)

    // Add the effect view to the content view of the window, NOT the ToastView
    toastWindow
      .setFrame(
        NSRect(
          x: 0,
          y: 0,
          width: contentSize.width,
          height: contentSize.height
        ),
        display: true
      )

    let x = mainScreen.frame.size.width / 2 - toastWindow.frame.width / 2
    var y = mainScreen.frame.origin.y + mainScreen.frame.size.height * 0.1

    if image != nil {
      y = mainScreen.frame.origin.y + toastWindow.frame.height
    }

    toastWindow.setFrameOrigin(
      NSPoint(
        x: x,
        y: y
      ))

    toastWindow.makeKeyAndOrderFront(nil)

    let deadline = timeout != nil ? DispatchTime.now() + timeout!.doubleValue : .now() + 2
    DispatchQueue.main.asyncAfter(deadline: deadline) {
      self.dismissToast()
    }
  }

  func dismissToast() {
    toastWindow.orderOut(nil)
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
