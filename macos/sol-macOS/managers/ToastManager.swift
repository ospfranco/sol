class ToastManager {
  private var toastWindow: Toast = Toast(contentRect: .zero)
  
  static public let shared = ToastManager()
  
  func showToast(_ text: String, variant: String, timeout: NSNumber?, image: NSImage?) {
    guard let mainScreen = PanelManager.shared.getPreferredScreen()
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
    toastView.layoutSubtreeIfNeeded()  // Ensure layout is performed
    
    let contentSize = toastView.intrinsicContentSize
    toastView.frame = NSRect(x: 0, y: 0, width: contentSize.width, height: contentSize.height)
    
    let effectView = NSVisualEffectView(
      frame: NSRect(x: 0, y: 0, width: contentSize.width, height: contentSize.height)
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
        NSRect(
          x: 0,
          y: 0,
          width: contentSize.width,
          height: contentSize.height
        ),
        display: true
      )
    
    let x = mainScreen.frame.size.width / 2 - toastWindow.frame.width / 2
    var y = mainScreen.frame.origin.y + mainScreen.frame.size.height * 0.1
    
    if image != nil {
      y = mainScreen.frame.origin.y + toastWindow.frame.height
    }
    
    toastWindow.setFrameOrigin(
      NSPoint(
        x: x,
        y: y
      ))
    
    toastWindow.makeKeyAndOrderFront(nil)
    
    let deadline = timeout != nil ? DispatchTime.now() + timeout!.doubleValue : .now() + 2
    DispatchQueue.main.asyncAfter(deadline: deadline) {
      self.dismissToast()
    }
  }
  
  func dismissToast() {
    toastWindow.orderOut(nil)
  }
}
