class ClickableOverlayView: NSView {
  var onClick: (() -> Void)?
  override func mouseDown(with event: NSEvent) {
    onClick?()
  }
}
class ShellOutputView: NSView {
  private var gradientLayer: CAGradientLayer?

  private let textView = NSTextView()
  private let scrollView = NSScrollView()

  private let panelWidth: CGFloat = 500
  private let panelHeight: CGFloat = 180

  init() {
    super.init(frame: .zero)

    self.wantsLayer = true  // Enable the layer property for custom layers (e.g., gradient)
    setupView()
    self.needsLayout = true
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  func setupView() {
    self.gradientLayer = CAGradientLayer()
    self.gradientLayer!.colors = [
      NSColor.clear.cgColor, NSColor.clear.cgColor,
    ]
    self.gradientLayer!.startPoint = CGPoint(x: 0.5, y: 0)
    self.gradientLayer!.endPoint = CGPoint(x: 0.5, y: 1)
    self.gradientLayer!.frame = self.bounds
    self.layer?.addSublayer(self.gradientLayer!)

    textView.isEditable = false
    textView.isSelectable = false
    textView.drawsBackground = false
    textView.textColor = NSColor.labelColor
    textView.font = NSFont.monospacedSystemFont(ofSize: 11, weight: .regular)
    textView.isVerticallyResizable = true
    textView.isHorizontallyResizable = false
    textView.textContainer?.widthTracksTextView = true
    textView.textContainer?.heightTracksTextView = false
    textView.autoresizingMask = [.width]

    scrollView.documentView = textView
    scrollView.hasVerticalScroller = true
    scrollView.hasHorizontalScroller = false
    scrollView.autoresizingMask = [.width, .height]
    scrollView.frame = self.bounds
    scrollView.backgroundColor = .clear
    scrollView.drawsBackground = false
    scrollView.contentView.backgroundColor = .clear
    scrollView.contentView.drawsBackground = false
    // Remove automatic contentInsets (introduced in macOS 11+)
    if #available(macOS 11.0, *) {
      scrollView.automaticallyAdjustsContentInsets = false
      scrollView.contentInsets = NSEdgeInsets()
    }
    self.addSubview(scrollView)

    let overlayView = ClickableOverlayView(frame: self.bounds)
    overlayView.autoresizingMask = [.width, .height]
    overlayView.wantsLayer = true
    overlayView.layer?.backgroundColor = NSColor.clear.cgColor
    self.addSubview(overlayView)
  }

  func setSuccessStyle() {
    if let gradient = self.gradientLayer {
      gradient.colors = [
        NSColor.systemGreen.withAlphaComponent(0.15).cgColor,
        NSColor.systemGreen.withAlphaComponent(0.02).cgColor,
      ]
    }
  }

  func setFailedStyle() {
    if let gradient = self.gradientLayer {
      gradient.colors = [
        NSColor.systemRed.withAlphaComponent(0.15).cgColor,
        NSColor.systemRed.withAlphaComponent(0.02).cgColor,
      ]
    }
  }

  func appendOutput(_ text: String) {
    textView.string += text
    textView.scrollToEndOfDocument(nil)
  }

  override func layout() {
    super.layout()
    self.gradientLayer?.frame = self.bounds
    scrollView.frame = self.bounds
  }

}
