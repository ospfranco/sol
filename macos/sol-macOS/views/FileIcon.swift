import Cocoa

class FileIcon: NSView {
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
    let url = URL(
      fileURLWithPath: (self.url as String).replacingOccurrences(
        of: "~", with: FileManager.default.homeDirectoryForCurrentUser.path))

    let icon = NSWorkspace.shared.icon(forFile: url.path)
    self.image.image = icon
    image.autoresizingMask = [.height, .width]
    self.addSubview(image)
  }
}

@objc(FileIconManager)
class FileIconManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> NSView! {
    return FileIcon()
  }

}
