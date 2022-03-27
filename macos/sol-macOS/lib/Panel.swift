import Foundation

final class Panel: NSWindow {
    init(contentRect: NSRect, backing: NSWindow.BackingStoreType, defer flag: Bool) {
      super.init(contentRect: contentRect, styleMask: [.titled, .closable, .miniaturizable, .fullSizeContentView, .nonactivatingPanel], backing: backing, defer: flag)
      
//      self.displaysWhenScreenProfileChanges = false
//      self.visible
//      self.isFloatingPanel = true
//      self.level = .floating
      // Allow the pannel to appear in a fullscreen space
      self.collectionBehavior.insert(.fullScreenAuxiliary)
      self.hidesOnDeactivate = true
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

    }
    
    override var canBecomeKey: Bool {
        return true
    }
    
    override var canBecomeMain: Bool {
      return false
    }
}
