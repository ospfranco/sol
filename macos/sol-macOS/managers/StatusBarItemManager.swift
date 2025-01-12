class StatusBarItemManager {
  static public let shared = StatusBarItemManager()
  
  private var statusBarItem: NSStatusItem?
  
  @objc func statusBarItemCallback(_: AnyObject?) {
    SolEmitter.sharedInstance.onStatusBarItemClick()
  }
  
  func setStatusBarTitle(_ title: String) {
    DispatchQueue.main.async {
      if self.statusBarItem == nil {
        self.statusBarItem = NSStatusBar.system
          .statusItem(withLength: NSStatusItem.variableLength)
      }
      
      if title.isEmpty {
        NSStatusBar.system.removeStatusItem(self.statusBarItem!)
        self.statusBarItem = nil
      } else {
        if let button = self.statusBarItem?.button {
          button.title = title
          button.action = #selector(self.statusBarItemCallback(_:))
          button.sizeToFit()
        }
      }
    }
  
  }
}
