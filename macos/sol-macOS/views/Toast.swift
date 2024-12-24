import Foundation
import Cocoa

final class Toast: NSPanel, NSWindowDelegate {
  init(contentRect: NSRect) {
    super.init(
      contentRect: contentRect,
      styleMask: [.titled, .fullSizeContentView, .nonactivatingPanel],
      backing: .buffered,
      defer: false
    )
    
    self.level = .floating
    self.collectionBehavior.insert(.fullScreenAuxiliary)
    self.collectionBehavior.insert(.canJoinAllSpaces)
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.styleMask.remove(.titled)
    self.styleMask.insert(.fullSizeContentView)
    self.isMovable = false
    self.isMovableByWindowBackground = false
    self.isReleasedWhenClosed = false
    self.isOpaque = false
    self.backgroundColor = .clear
    self.setFrameAutosaveName("")
  }
  
  override var canBecomeKey: Bool {
    return false
  }
  
  override var canBecomeMain: Bool {
    return false
  }
}
