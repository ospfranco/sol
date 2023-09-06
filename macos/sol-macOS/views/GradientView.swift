import Cocoa

class GradientView: NSView {
  
  @objc var startColor: NSString = ""
  @objc var endColor: NSString = ""
  @objc var angle: Double = 0
  @objc var cornerRadius: Double = 0
  
  var bgGradient: CAGradientLayer!
  
  override var isFlipped: Bool {
    return true
  }
  
  override func didSetProps(_ changedProps: [String]!) {
    let gradient2 = CAGradientLayer()
    gradient2.frame =  CGRect(origin: CGPoint.zero, size: self.frame.size)
    gradient2.colors = [NSColor(hex: self.startColor)!.cgColor, NSColor(hex: self.endColor)!.cgColor]
    gradient2.apply(angle: self.angle)

    self.layer?.replaceSublayer(bgGradient, with: gradient2)
    bgGradient = gradient2
    
    self.layer?.cornerRadius = self.cornerRadius
  }
  
  // Required to flip touch events
  override func convert(_ point: NSPoint, from view: NSView?) -> NSPoint {
    return NSPoint(x: point.x, y: self.frame.height - point.y)
  }
  
  override var frame: CGRect {
      didSet {
        let gradient2 = CAGradientLayer()
        gradient2.frame =  CGRect(origin: CGPoint.zero, size: self.frame.size)
        gradient2.colors = [NSColor(hex: self.startColor)?.cgColor, NSColor(hex: self.endColor)?.cgColor]
        gradient2.apply(angle: self.angle)

        self.layer?.replaceSublayer(bgGradient, with: gradient2)
        bgGradient = gradient2
      }
  }
  
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    self.wantsLayer = true
    
    let gradient2 = CAGradientLayer()
    gradient2.frame =  CGRect(origin: CGPoint.zero, size: self.frame.size)
    gradient2.colors = []
    gradient2.apply(angle: 135)

    self.layer?.addSublayer(gradient2)
    bgGradient = gradient2
  }
  
  

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
}

@objc (GradientViewManager)
class GradientViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> NSView! {
    return GradientView()
  }

}
