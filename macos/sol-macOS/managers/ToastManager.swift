class ToastManager {
  private var toastWindow: Toast = Toast(contentRect: .zero)

  static public let shared = ToastManager()

  func showToast(
    _ text: String, variant: String, timeout: NSNumber?, image: NSImage?
  ) {
    guard let screen = PanelManager.shared.getPreferredScreen()
    else {
      return
    }

    let variantEnum: ToastVariant =
      switch variant {
      case "error": .error
      case "success": .success
      default: .none
      }

    let toastView = ToastView(
      text: text,
      variant: variantEnum,
      image: image,
      dismissCallback: {
        DispatchQueue.main.async {
          self.dismissToast()
        }
      }
    )
    toastView.layoutSubtreeIfNeeded()

    let contentSize = toastView.intrinsicContentSize
    let size = NSRect(
      x: 0, y: 0, width: contentSize.width, height: contentSize.height)
    toastView.frame = size

    let effectView = NSVisualEffectView(
      frame: size
    )
    effectView.autoresizingMask = [.width, .height]
    effectView.material = .hudWindow  // Or other material
    effectView.blendingMode = .behindWindow
    effectView.state = .active

    toastWindow.contentView = effectView
    toastWindow.contentView!.addSubview(toastView)

    // Add the effect view to the content view of the window, NOT the ToastView
    toastWindow
      .setFrame(
        size,
        display: true
      )
    toastWindow.setContentSize(contentSize)

    // 0 is calculated from the origin of the main screen, which means screen.frame.origin.x can be negative
    let x =
      screen.frame.origin.x
      + (screen.frame.size.width / 2 - contentSize.width / 2)
    var y = screen.frame.origin.y + screen.frame.size.height * 0.1

    if image != nil {
      y = screen.frame.origin.y + toastWindow.frame.height
    }

    toastWindow.setFrameOrigin(
      NSPoint(
        x: x,
        y: y
      ))

    toastWindow.orderFront(nil)

    let deadline =
      timeout != nil ? DispatchTime.now() + timeout!.doubleValue : .now() + 2
    DispatchQueue.main.asyncAfter(deadline: deadline) {
      self.dismissToast()
    }
  }

  func dismissToast() {
    toastWindow.orderOut(nil)
  }
}
