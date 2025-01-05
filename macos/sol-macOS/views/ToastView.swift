import Cocoa

enum ToastVariant {
  case success
  case error
  case none
  
  var gradientColors: [NSColor] {
    switch self {
    case .success:
      return [NSColor.green.withAlphaComponent(0.2), .clear]
    case .error:
      return [NSColor.red.withAlphaComponent(0.2), .clear]
    case .none:
      return [.clear, .clear]
    }
  }
  
  var dotColor: NSColor {
    switch self {
    case .success:
      return NSColor.green
    case .error:
      return NSColor.red
    case .none:
      return .clear
    }
  }
}

class VisualEffectBlurView: NSView {
  override func viewDidMoveToSuperview() {
    super.viewDidMoveToSuperview()
    
    // Add a visual effect view behind this view
    let visualEffectView = NSVisualEffectView()
    visualEffectView.blendingMode = .behindWindow
    visualEffectView.material = .hudWindow
    visualEffectView.state = .active
    visualEffectView.frame = self.bounds
    self.addSubview(visualEffectView, positioned: .below, relativeTo: nil)
    
    // Ensure the view updates the visual effect view when layout changes
    visualEffectView.needsDisplay = true
  }
}

class ToastView: NSView {
  var text: String
  var variant: ToastVariant
  var image: NSImage?
  
  private var textLabel: NSTextField!
  private var imageView: NSImageView?
  private var gradientLayer: CAGradientLayer?
  private var dotView: NSView?
  
  init(text: String, variant: ToastVariant, image: NSImage? = nil) {
    self.text = text
    self.variant = variant
    self.image = image
    super.init(frame: .zero)
    
    self.wantsLayer = true  // Enable the layer property for custom layers (e.g., gradient)
    setupView()
    self.needsLayout = true
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  private func setupView() {
    // Visual Effect Blur View (optional)
    let blurView = VisualEffectBlurView()
    blurView.frame = self.bounds
    self.addSubview(blurView, positioned: .below, relativeTo: nil)  // Ensure it's behind everything else
    
    // Gradient background
    gradientLayer = CAGradientLayer()
    gradientLayer?.colors = variant.gradientColors.map { $0.cgColor }
    gradientLayer?.startPoint = CGPoint(x: 0, y: 0.5)
    gradientLayer?.endPoint = CGPoint(x: 1, y: 0.5)
    gradientLayer?.frame = self.bounds
    self.layer?.addSublayer(gradientLayer!)
    
    // Dot handling
    dotView = NSView()
    dotView?.wantsLayer = true
    dotView?.layer?.cornerRadius = 5
    dotView?.layer?.backgroundColor = variant.dotColor.cgColor
    dotView?.frame = NSRect(x: 10, y: 20, width: 10, height: 10)
    self.addSubview(dotView!)
    
    // Image handling
    if let image = image {
      imageView = NSImageView(image: image)
      imageView?.frame = NSRect(x: 10, y: 20, width: 40, height: 40)  // Adjust as needed
      self.addSubview(imageView!)
    }
    
    // Text Label
    textLabel = NSTextField(labelWithString: text)
    textLabel.alignment = .center
    textLabel.lineBreakMode = .byWordWrapping
    textLabel.isEditable = false
    textLabel.isSelectable = false
    self.addSubview(textLabel)
  }
  
  @objc private func dismissToast() {
    // Handle toast dismissal (you can implement your own logic here)
    self.removeFromSuperview()
  }
  
  override func mouseDown(with event: NSEvent) {
    dismissToast()
  }
  
  // Override intrinsicContentSize to return the minimum size based on content
  override var intrinsicContentSize: NSSize {
    let minWidth: CGFloat = 200
    let padding: CGFloat = 10
    
    if image != nil {
      return NSSize(width: 400, height: 400)
    }
    
    let textHeight = textLabel.intrinsicContentSize.height
    let textWidth = textLabel.intrinsicContentSize.width
    let height: CGFloat = textHeight
    
    return NSSize(width: max(minWidth, textWidth + padding * 2 + 20), height: height + padding * 2)
  }
  
  override func layout() {
    super.layout()
    
    // Update gradient layer frame
    gradientLayer?.frame = self.bounds
    
    // Layout the textLabel based on the actual content size
    let textWidth = self.intrinsicContentSize.width - 2 * 20
    textLabel.frame = NSRect(x: 20 + 15, y: 10, width: textWidth - 15, height: textLabel.intrinsicContentSize.height)
    
    // Layout the dot view
    if let dotView = dotView {
      dotView.frame.origin = NSPoint(x: 10, y: (self.bounds.height - dotView.frame.height) / 2)
    }
    
    // Layout the imageView if it exists
    if let imageView = imageView {
      imageView.frame.origin = NSPoint(x: 10, y: (self.bounds.height - imageView.frame.height) / 2)
    }
  }
  
  override func viewDidMoveToSuperview() {
    super.viewDidMoveToSuperview()
    self.needsLayout = true
  }
}
