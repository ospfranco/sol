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
  
  override func didSetProps(_ changedProps: [String]!) {
    self.layer?.cornerRadius = self.cornerRadius
    self.material = self.disabled ? .windowBackground : .sidebar
  }
  
  override var frame: CGRect {
      didSet {
        let gradient = CAGradientLayer()
        gradient.frame =  CGRect(origin: CGPoint.zero, size: self.frame.size)
        gradient.colors = [NSColor(hex: self.startColor)!.cgColor, NSColor(hex: self.endColor)!.cgColor, NSColor(hex: self.startColor)!.cgColor]
        gradient.apply(angle: 90)

        let shape = CAShapeLayer()
        shape.lineWidth = 2
        
        shape.path = NSBezierPath(roundedRect: self.bounds, xRadius: self.cornerRadius, yRadius: self.cornerRadius).cgPath
        shape.strokeColor = NSColor.black.cgColor
        shape.fillColor = NSColor.clear.cgColor
        gradient.mask = shape
        
        self.layer?.replaceSublayer(borderGradient, with: gradient)
        borderGradient = gradient
      }
  }

  override func convert(_ point: NSPoint, from view: NSView?) -> NSPoint {
    return NSPoint(x: point.x, y: self.frame.height - point.y)
  }
  
  override init(frame: CGRect) {
    super.init(frame: frame)

    self.material = self.disabled ? .windowBackground : .sidebar
    self.wantsLayer = true
    self.layer?.cornerRadius = self.cornerRadius
    self.layer?.masksToBounds = true
    
    let gradient = CAGradientLayer()
    self.layer?.addSublayer(gradient)
    borderGradient = gradient
  }
  
  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
}

@objc (BlurViewManager)
class BlurViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> NSView! {
    return BlurView()
  }

}
