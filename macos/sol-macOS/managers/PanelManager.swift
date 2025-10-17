enum PreferredScreen {
  case frontmost
  case withMouse
}

@objc class PanelManager: NSObject {
  let baseSize = NSSize(width: 700, height: 450)
  public var preferredScreen: PreferredScreen = .frontmost
  private let mainWindow: Panel = Panel(contentRect: .zero)
  private var rootView: NSView?

  @objc static public let shared = PanelManager()

  public func setRootView(_ rootView: NSView) {
    mainWindow.contentView!.addSubview(rootView)
    self.rootView = rootView
  }

  @objc func showWindow(target: String? = nil) {
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

    SolEmitter.sharedInstance.onShow(target: nil)
  }

  @objc func hideWindow() {
    mainWindow.orderOut(self)
    SolEmitter.sharedInstance.onHide()
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
      hideWindow()
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
