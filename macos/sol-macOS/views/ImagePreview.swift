import Cocoa

class ImagePreview: NSView {
  let imageView = NSImageView()

  @objc var path: NSString = "" {
    didSet {
      self.setupView()
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    imageView.imageScaling = .scaleProportionallyUpOrDown
    imageView.autoresizingMask = [.height, .width]
    self.addSubview(imageView)
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }

  private func setupView() {
    let pathString = self.path as String
    if pathString.isEmpty {
      return
    }

    if let image = NSImage(contentsOfFile: pathString) {
      self.imageView.image = image
    }
  }

  override func layout() {
    super.layout()
    imageView.frame = self.bounds
  }
}

@objc(ImagePreviewManager)
class ImagePreviewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> NSView! {
    return ImagePreview()
  }
}
