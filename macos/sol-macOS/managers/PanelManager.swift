enum PreferredScreen {
  case frontmost
  case withMouse
}

@objc class PanelManager: NSObject {
  public var preferredScreen: PreferredScreen = .frontmost
  private let mainWindow: Panel = Panel(contentRect: .zero)
  private var rootView: RCTRootView?
  
  @objc static public let shared = PanelManager()
  
  public func setRootView(rootView: RCTRootView) {
    mainWindow.contentView!.addSubview(rootView)
    self.rootView = rootView
  }
  
  func innerShow() {
    HotKeyManager.shared.settingsHotKey.isPaused = false
    mainWindow.setIsVisible(false)
    mainWindow.makeKeyAndOrderFront(self)
    
    guard
      let screen =
        (
          preferredScreen == .frontmost ? getFrontmostScreen() : getScreenWithMouse()
        )
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
    if mainWindow.isVisible {
      return
    }
    
    // Give react native event listener a bit of time to react
    // and switch components
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
      self.innerShow()
    }
  }
  
  @objc func hideWindow() {
    //    #if !DEBUG
    if mainWindow.isVisible {
//      overlayWindow.orderOut(self)
      mainWindow.orderOut(self)
      SolEmitter.sharedInstance.onHide()
      HotKeyManager.shared.settingsHotKey.isPaused = true
    }
    //    #endif
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
        (
          preferredScreen == .frontmost ? getFrontmostScreen() : getScreenWithMouse()
        )
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
    mainWindow.center()
    return mainWindow.screen ?? NSScreen.main
  }

}
