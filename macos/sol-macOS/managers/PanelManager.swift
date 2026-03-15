enum PreferredScreen {
  case frontmost
  case withMouse
}

@objc class PanelManager: NSObject {
  let baseSize = NSSize(width: 700, height: 450)
  public var preferredScreen: PreferredScreen = .frontmost
  let mainWindow: Panel = Panel(contentRect: .zero)
  private var rootView: NSView?
  /// True when the window was hidden by clicking outside (soft hide).
  /// The main hotkey should let JS reset state before showing the window.
  private(set) var wasSoftHidden = false

  @objc static public let shared = PanelManager()

  public func setRootView(_ rootView: NSView) {
    mainWindow.contentView!.addSubview(rootView)
    self.rootView = rootView
  }

  @objc func showWindow(target: String? = nil) {
    let resumingFromSoftHide = wasSoftHidden
    wasSoftHidden = false
    HotKeyManager.shared.settingsHotKey.isPaused = false

    guard
      let screen =
        (preferredScreen == .frontmost ? getFrontmostScreen() : getScreenWithMouse())
    else {
      return
    }

    let yOffset = screen.visibleFrame.height * 0.3
    let x = screen.visibleFrame.midX - baseSize.width / 2
    let y = screen.visibleFrame.midY - mainWindow.frame.height + yOffset
    mainWindow.setFrameOrigin(NSPoint(x: floor(x), y: floor(y)))

    // Don't show the window yet when:
    // - A target widget is specified (let JS set the widget first)
    // - Resuming from soft-hide with no target (let JS reset state first)
    // In both cases, JS calls showWindowOnly() after the state update renders.
    if target == nil && !resumingFromSoftHide {
      mainWindow.makeKeyAndOrderFront(self)
    }

    SolEmitter.sharedInstance.onShow(target: target)
  }

  /// Show the window without emitting onShow (for JS-initiated calls where widget is already set)
  @objc func showWindowOnly() {
    HotKeyManager.shared.settingsHotKey.isPaused = false

    guard
      let screen =
        (preferredScreen == .frontmost ? getFrontmostScreen() : getScreenWithMouse())
    else {
      return
    }

    let yOffset = screen.visibleFrame.height * 0.3
    let x = screen.visibleFrame.midX - baseSize.width / 2
    let y = screen.visibleFrame.midY - mainWindow.frame.height + yOffset
    mainWindow.setFrameOrigin(NSPoint(x: floor(x), y: floor(y)))

    mainWindow.makeKeyAndOrderFront(self)
  }

  func getWindow() -> NSWindow? {
    return mainWindow
  }

  /// Hard hide: hides the window and tells JS to reset all state.
  /// Used by ESC, hotkey toggle, and other explicit close actions.
  @objc func hideWindow() {
    wasSoftHidden = false
    QuickLookManager.shared.hide()
    mainWindow.orderOut(self)
    SolEmitter.sharedInstance.onHide()
    HotKeyManager.shared.settingsHotKey.isPaused = true
  }

  /// Soft hide: hides the window visually but preserves JS state.
  /// Used when the user clicks outside (window loses focus).
  func softHideWindow() {
    QuickLookManager.shared.hide()
    mainWindow.orderOut(self)
    wasSoftHidden = true
    HotKeyManager.shared.settingsHotKey.isPaused = true
  }

  @objc func resetSize() {
    let origin = CGPoint(x: 0, y: 0)
    let size = baseSize
    let frame = NSRect(origin: origin, size: size)
    mainWindow.setFrame(frame, display: false)
    mainWindow.center()
  }

  @objc func setHeight(_ height: Int) {
    var finalHeight = height
    if height == 0 {
      finalHeight = Int(baseSize.height)
    }

    let size = NSSize(width: Int(baseSize.width), height: finalHeight)
    guard
      let screen =
        (preferredScreen == .frontmost ? getFrontmostScreen() : getScreenWithMouse())
    else {
      return
    }

    let yOffset = screen.visibleFrame.height * 0.3
    let y = screen.visibleFrame.midY - CGFloat(finalHeight) + yOffset

    let frame = NSRect(
      x: mainWindow.frame.minX, y: y, width: baseSize.width, height: CGFloat(finalHeight))
    self.mainWindow.setFrame(frame, display: true)

    self.rootView?.setFrameSize(size)

    self.rootView?.setFrameOrigin(NSPoint(x: 0, y: 0))
  }

  @objc func setRelativeSize(_ proportion: Double) {
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

  func toggle() {
    if mainWindow.isVisible {
      // Let JS decide: toggle off (Search) or switch to Search (widget)
      SolEmitter.sharedInstance.onShow(target: nil, isToggle: true)
    } else {
      showWindow()
    }
  }

  func setPreferredScreen(_ preferredScreen: PreferredScreen) {
    self.preferredScreen = preferredScreen
  }

  func getPreferredScreen() -> NSScreen? {
    return self.preferredScreen == .frontmost ? getFrontmostScreen() : getScreenWithMouse()
  }

  func getFrontmostScreen() -> NSScreen? {
    return mainWindow.screen ?? NSScreen.main
  }

}
