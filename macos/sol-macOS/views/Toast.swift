import Foundation
import Cocoa

final class Toast: NSWindow, NSWindowDelegate {
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
    
    // Access the contentView and enable layer backing
//    self.contentView?.wantsLayer = true
//    if let windowLayer = self.contentView?.layer {
//      windowLayer.cornerRadius = 10.0 // Rounded corners for the window
//      windowLayer.masksToBounds = true // Clip content to the rounded bounds
//      windowLayer.borderWidth = 2.0
//      windowLayer.borderColor = NSColor(calibratedRed: 0, green: 1, blue: 0.5, alpha: 0.2).cgColor
//    }
  }
}
