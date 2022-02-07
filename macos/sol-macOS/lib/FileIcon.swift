import Cocoa


class _FileIcon: NSView {
  let image = NSImageView()
  @objc var url: NSString = "" {
    didSet {
      self.setupView()
    }
  }
  
  override init(frame: CGRect) {
  super.init(frame: frame)
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }

  private func setupView() {
    let icon = NSWorkspace.shared.icon(forFile: self.url as String)
    self.image.image = icon
    image.autoresizingMask = [.height, .width]
    self.addSubview(image)
  }
}

@objc (FileIconManager)
class FileIconManager: RCTViewManager {
 
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
 
  override func view() -> NSView! {
    return _FileIcon()
  }
 
}
