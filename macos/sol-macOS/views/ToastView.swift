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

class ToastView: NSView {
  var text: String
  var variant: ToastVariant
  var image: NSImage?

  private var textLabel: NSTextField!
  private var imageView: NSImageView?
  private var gradientLayer: CAGradientLayer?
  private var dotView: NSView?
  var dismissCallback: (() -> Void)?

  init(
    text: String, variant: ToastVariant, image: NSImage? = nil, dismissCallback: (() -> Void)? = nil
  ) {
    self.text = text
    self.variant = variant
    self.image = image
    self.dismissCallback = dismissCallback
    super.init(frame: .zero)

    self.wantsLayer = true  // Enable the layer property for custom layers (e.g., gradient)
    setupView()
    self.needsLayout = true
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  private func setupView() {
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
      imageView?.frame = NSRect(x: 0, y: 0, width: 380, height: 380)  // Adjust as needed
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
    self.dismissCallback?()
  }

  override func mouseDown(with event: NSEvent) {
    dismissToast()
  }

  // Override intrinsicContentSize to return the minimum size based on content
  override var intrinsicContentSize: NSSize {
    // Calculate the size based on the textLabel's intrinsic content size and optional image
    let minWidth: CGFloat = 120  // Minimum width
    let padding: CGFloat = 10  // Padding between elements

    // If there is an image, adjust width accordingly
    if image != nil {
      return NSSize(width: 400, height: 400)
    }

    // Adjust the height for the text content, allowing room for padding
    let textHeight = textLabel.intrinsicContentSize.height
    let textWidth = textLabel.intrinsicContentSize.width
    let height: CGFloat = textHeight

    return NSSize(width: max(minWidth, textWidth + padding * 2 + 20), height: height + padding * 2)
  }

  override func layout() {
    super.layout()

    gradientLayer?.frame = self.bounds

    // Layout the textLabel based on the actual content size
    let textWidth = self.intrinsicContentSize.width
    textLabel.frame = NSRect(
      x: 10, y: 10, width: textWidth, height: textLabel.intrinsicContentSize.height)

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

    // Ensure layout is updated once the view is added to the superview
    self.needsLayout = true
  }
}
