import Foundation

let appDelegate = NSApp.delegate as? AppDelegate

final class Panel: NSPanel, NSWindowDelegate {
  var visualEffect: NSVisualEffectView!
  
  init(contentRect: NSRect, backing: NSWindow.BackingStoreType, defer flag: Bool) {
    super.init(
      contentRect: contentRect,
      styleMask: [.titled, .fullSizeContentView, .nonactivatingPanel],
      backing: backing,
      defer: flag
    )

    self.level = .mainMenu + 3
    self.collectionBehavior.insert(.fullScreenAuxiliary) // Allows the pannel to appear in a fullscreen space
    self.collectionBehavior.insert(.canJoinAllSpaces)
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.isMovable = false
    self.isMovableByWindowBackground = false
    self.isReleasedWhenClosed = false
    self.isOpaque = false
    self.delegate = self
    
    visualEffect = NSVisualEffectView()
    visualEffect.blendingMode = .behindWindow
    visualEffect.material = .underWindowBackground
    visualEffect.autoresizingMask = [.minXMargin, .maxXMargin, .minYMargin, .maxYMargin, .width, .height]
    
    self.contentView = visualEffect
  }

  func windowDidResignKey(_ notification: Notification) {
    DispatchQueue.main.async {
      appDelegate?.hideWindow()
    }
  }
}
