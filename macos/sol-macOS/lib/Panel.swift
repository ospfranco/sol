import Foundation

final class Panel: NSPanel {
    init(contentRect: NSRect, backing: NSWindow.BackingStoreType, defer flag: Bool) {
      super.init(contentRect: contentRect, styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView], backing: backing, defer: flag)
      
      self.isFloatingPanel = true
      self.level = .floating
      self.collectionBehavior.insert(.fullScreenAuxiliary)
      self.collectionBehavior.insert(.moveToActiveSpace)
      self.titleVisibility = .hidden
      self.titlebarAppearsTransparent = true
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
        return true
    }
}
