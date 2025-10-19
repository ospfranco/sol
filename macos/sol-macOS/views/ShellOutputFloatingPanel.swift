class ClickableOverlayView: NSView {
  var onClick: (() -> Void)?
  override func mouseDown(with event: NSEvent) {
    onClick?()
  }
}
class ShellOutputFloatingPanel: NSPanel {
  private var gradientLayer: CAGradientLayer?
  // Add gradient layer (initially clear)

  //  // Ensure gradient resizes with effectView
  //  effectView.postsFrameChangedNotifications = true
  //  NotificationCenter.default.addObserver(self, selector: #selector(updateGradientFrame), name: NSView.frameDidChangeNotification, object: effectView)
  //  @objc private func updateGradientFrame() {
  //    if let effectView = self.contentView as? NSVisualEffectView, let gradient = gradientLayer {
  //      gradient.frame = effectView.bounds
  //    }
  //  }

  private let textView = NSTextView()
  private let scrollView = NSScrollView()
  private var timer: Timer?

  private let panelWidth: CGFloat = 500
  private let panelHeight: CGFloat = 180

  init() {
    let screen = NSScreen.main
    let margin: CGFloat = 32
    let panelRect: NSRect
    if let screen = screen {
      panelRect = NSRect(
        x: screen.visibleFrame.maxX - panelWidth - margin,
        y: screen.visibleFrame.minY + margin,
        width: panelWidth,
        height: panelHeight
      )
    } else {
      panelRect = NSRect(x: 100, y: 100, width: panelWidth, height: panelHeight)
    }
    super.init(
      contentRect: panelRect,
      styleMask: [.fullSizeContentView, .nonactivatingPanel],
      backing: .buffered,
      defer: false
    )
    self.level = .floating
    self.collectionBehavior.insert(.fullScreenAuxiliary)
    self.collectionBehavior.insert(.canJoinAllSpaces)
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.isMovable = false
    self.isMovableByWindowBackground = false
    self.isReleasedWhenClosed = false
    self.isOpaque = false
    self.setFrameAutosaveName("")

    self.backgroundColor = .clear
    self.ignoresMouseEvents = false
    self.hasShadow = true

    // Rounded corners
    let effectView = NSVisualEffectView(frame: self.contentRect(forFrameRect: panelRect))
    effectView.autoresizingMask = [.width, .height]
    effectView.material = .contentBackground
    effectView.blendingMode = .behindWindow
    effectView.state = .active
    effectView.wantsLayer = true
    effectView.layer?.cornerRadius = 18
    effectView.layer?.masksToBounds = true

    let gradient = CAGradientLayer()
    gradient.colors = [NSColor.clear.cgColor, NSColor.clear.cgColor]
    gradient.startPoint = CGPoint(x: 0, y: 0.5)
    gradient.endPoint = CGPoint(x: 1, y: 0.5)
    gradient.frame = effectView.bounds
    gradient.cornerRadius = 18
    gradient.masksToBounds = true
    effectView.layer?.insertSublayer(gradient, at: 0)
    self.gradientLayer = gradient

    textView.isEditable = false
    textView.isSelectable = false
    textView.drawsBackground = false
    textView.textColor = NSColor.white
    textView.font = NSFont.monospacedSystemFont(ofSize: 11, weight: .regular)

    scrollView.documentView = textView
    scrollView.hasVerticalScroller = true
    scrollView.hasHorizontalScroller = false
    scrollView.autoresizingMask = [.width, .height]
    scrollView.frame = effectView.bounds
    scrollView.backgroundColor = .clear
    effectView.addSubview(scrollView)

    let overlayView = ClickableOverlayView(frame: effectView.bounds)
    overlayView.autoresizingMask = [.width, .height]
    overlayView.onClick = { [weak self] in
      self?.orderOut(nil)
    }
    overlayView.wantsLayer = true
    overlayView.layer?.backgroundColor = NSColor.clear.cgColor
    effectView.addSubview(overlayView)
    self.contentView = effectView
  }

  func setFinishedStyle() {
    if let gradient = self.gradientLayer {
      gradient.colors = [NSColor.systemGreen.cgColor, NSColor.clear.cgColor]
    }
    textView.textColor = NSColor.white
  }

  func appendOutput(_ text: String) {
    textView.string += text
    textView.scrollToEndOfDocument(nil)
  }

  func showAndClose(after seconds: TimeInterval) {
    self.makeKeyAndOrderFront(nil)
    timer?.invalidate()
    timer = Timer.scheduledTimer(withTimeInterval: seconds, repeats: false) { [weak self] _ in
      self?.orderOut(nil)
    }
  }

  deinit {
    timer?.invalidate()
  }
}
