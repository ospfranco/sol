import Cocoa

class BlurView: NSVisualEffectView {
  @objc var borderRadius: Double = 0
  @objc var disabled: Bool = false
  @objc var inViewBlur: Bool = false

  override var isFlipped: Bool {
    return true
  }

  override func didSetProps(_: [String]!) {
    layer?.cornerRadius = borderRadius
    material = disabled ? .windowBackground : .headerView
  }

  override func convert(_ point: NSPoint, from _: NSView?) -> NSPoint {
    return NSPoint(x: point.x, y: frame.height - point.y)
  }

  override init(frame: CGRect) {
    super.init(frame: frame)

    material = inViewBlur ? .menu : .sidebar
    material = disabled ? .windowBackground : material

    wantsLayer = true
    layer?.cornerRadius = borderRadius
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
