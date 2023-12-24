import Cocoa

class BlurView: NSVisualEffectView {
  var borderGradient: CAGradientLayer!
  @objc var startColor: NSString = ""
  @objc var endColor: NSString = ""
  @objc var cornerRadius: Double = 0
  @objc var disabled: Bool = false

  override var isFlipped: Bool {
    return true
  }

  override func didSetProps(_: [String]!) {
    layer?.cornerRadius = cornerRadius
    material = disabled ? .windowBackground : .sidebar
  }

  override var frame: CGRect {
    didSet {
      let gradient = CAGradientLayer()
      gradient.frame = CGRect(origin: CGPoint.zero, size: self.frame.size)
      gradient.colors = [
        NSColor(hex: self.startColor)!.cgColor,
        NSColor(hex: self.endColor)!.cgColor,
        NSColor(hex: self.startColor)!.cgColor,
      ]
      gradient.apply(angle: 90)

      let shape = CAShapeLayer()
      shape.lineWidth = 2

      shape.path = NSBezierPath(
        roundedRect: self.bounds,
        xRadius: self.cornerRadius,
        yRadius: self.cornerRadius
      ).cgPath
      shape.strokeColor = NSColor.black.cgColor
      shape.fillColor = NSColor.clear.cgColor
      gradient.mask = shape

      self.layer?.replaceSublayer(borderGradient, with: gradient)
      borderGradient = gradient
    }
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

    let gradient = CAGradientLayer()
    layer?.addSublayer(gradient)
    borderGradient = gradient
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
