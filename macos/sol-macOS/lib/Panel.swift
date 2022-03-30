import Foundation

final class Panel: NSPanel, NSWindowDelegate {
  init(contentRect: NSRect, backing: NSWindow.BackingStoreType, defer flag: Bool) {
    super.init(
      contentRect: contentRect,
      styleMask: [.titled, .closable, .miniaturizable, .borderless, .fullSizeContentView, .nonactivatingPanel],
      backing: backing,
      defer: flag)

    self.level = .mainMenu
    // Allow the pannel to appear in a fullscreen space
    self.collectionBehavior.insert(.fullScreenAuxiliary)
    self.collectionBehavior.insert(.canJoinAllSpaces)
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.isMovable = false
    self.isMovableByWindowBackground = false
    self.isReleasedWhenClosed = false
    self.standardWindowButton(.closeButton)?.isHidden = true
    self.standardWindowButton(.miniaturizeButton)?.isHidden = true
    self.standardWindowButton(.zoomButton)?.isHidden = true
    self.isOpaque = false
//      self.alphaValue = 0.98
    let visualEffect = NSVisualEffectView(frame: frame)
    visualEffect.blendingMode = .behindWindow
    visualEffect.material = .fullScreenUI
    visualEffect.state = .active
    self.contentView!.addSubview(visualEffect)
    self.delegate = self
  }

 func windowDidResignKey(_ notification: Notification) {
   DispatchQueue.main.async {
     let appDelegate = NSApp.delegate as? AppDelegate
     appDelegate?.hideWindow(preventStateClear: false)
   }
  }
}
