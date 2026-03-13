import Cocoa

class FileImageView: NSView {
  let imageView = NSImageView()

  @objc var url: NSString = "" {
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
    let path = (self.url as String).replacingOccurrences(
      of: "file://", with: "")
    guard !path.isEmpty else { return }
    let image = NSImage(contentsOfFile: path)
    self.imageView.image = image
  }
}

@objc(FileImageViewManager)
class FileImageViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> NSView! {
    return FileImageView()
  }
}
