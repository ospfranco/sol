import Foundation

class Panel: NSPanel, NSWindowDelegate {
  var onResignKey: (() -> Void)?
  init(contentRect: NSRect) {
    super.init(
      contentRect: contentRect,
      styleMask: [.borderless, .fullSizeContentView, .nonactivatingPanel],
      backing: .buffered,
      defer: false
    )

    self.hasShadow = true
    self.level = .mainMenu + 3
    self.collectionBehavior.insert(.fullScreenAuxiliary)
    self.collectionBehavior.insert(.canJoinAllSpaces)
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.isMovableByWindowBackground = true
    self.isReleasedWhenClosed = false
    self.isOpaque = false
    self.delegate = self
    self.backgroundColor = NSColor.clear
  }

  override var canBecomeKey: Bool {
    return true
  }

  override var canBecomeMain: Bool {
    return true
  }
  
  func setOnResignKey(_ onResignKey: @escaping () -> Void) {
    self.onResignKey = onResignKey
  }

  func windowDidResignKey(_ notification: Notification) {
    if let onResignKey = onResignKey {
      onResignKey()
    }
  }
}
