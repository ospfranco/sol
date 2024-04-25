import Cocoa

class BlurView: NSVisualEffectView {
  @objc var cornerRadius: Double = 0
  @objc var disabled: Bool = false

  override var isFlipped: Bool {
    return true
  }

  override func didSetProps(_: [String]!) {
    layer?.cornerRadius = cornerRadius
    material = disabled ? .windowBackground : .headerView
  }

  override func convert(_ point: NSPoint, from _: NSView?) -> NSPoint {
    return NSPoint(x: point.x, y: frame.height - point.y)
  }

  override init(frame: CGRect) {
    super.init(frame: frame)

    material = disabled ? .windowBackground : .sidebar

    wantsLayer = true
    layer?.cornerRadius = cornerRadius
    layer?.masksToBounds = true
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
}

@objc(BlurViewManager)
class BlurViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> NSView! {
    return BlurView()
  }
}
