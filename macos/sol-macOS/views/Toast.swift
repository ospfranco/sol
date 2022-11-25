import Foundation

final class Toast: NSPanel, NSWindowDelegate {
  init(contentRect: NSRect, backing: NSWindow.BackingStoreType, defer flag: Bool) {
    super.init(
      contentRect: contentRect,
      styleMask: [.borderless, .hudWindow, .nonactivatingPanel],
      backing: backing,
      defer: flag
    )

    self.level = .floating
    self.collectionBehavior.insert(.fullScreenAuxiliary) // Allows the pannel to appear in a fullscreen space
    self.collectionBehavior.insert(.canJoinAllSpaces)
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.isMovable = false
    self.isMovableByWindowBackground = false
    self.isReleasedWhenClosed = false
    self.isOpaque = false
    self.delegate = self
  }
}
