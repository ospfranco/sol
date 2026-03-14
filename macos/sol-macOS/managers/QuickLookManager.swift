import Cocoa
import Quartz

/// NSPanel subclass that auto-promotes to key window on scroll/magnify
/// so pinch-to-zoom works without clicking the Quick Look window first.
private class QuickLookPanel: NSPanel {
  override func sendEvent(_ event: NSEvent) {
    if (event.type == .magnify || event.type == .scrollWheel) && !isKeyWindow {
      makeKey()
    }
    super.sendEvent(event)
  }
}

class QuickLookManager: NSObject {
  static let shared = QuickLookManager()

  private var qlWindow: NSPanel?
  private var previewView: QLPreviewView?
  private var pendingPath: String?
  var isVisible: Bool {
    return qlWindow?.isVisible ?? false
  }

  func toggle(path: String) {
    if isVisible {
      hide()
    } else {
      show(path: path)
    }
  }

  func show(path: String) {
    let url = URL(fileURLWithPath: path)

    if qlWindow == nil {
      setupWindow()
    }

    previewView?.previewItem = url as QLPreviewItem

    guard let parentWindow = PanelManager.shared.getWindow() else { return }

    positionWindow(relativeTo: parentWindow)

    if qlWindow?.parent == nil {
      parentWindow.addChildWindow(qlWindow!, ordered: .above)
    }

    qlWindow?.orderFront(nil)
  }

  func update(path: String) {
    guard isVisible else { return }
    // Cancel any previously scheduled update to coalesce rapid navigation
    NSObject.cancelPreviousPerformRequests(withTarget: self, selector: #selector(applyPendingUpdate), object: nil)
    pendingPath = path
    perform(#selector(applyPendingUpdate), with: nil, afterDelay: 0.15)
  }

  @objc private func applyPendingUpdate() {
    guard let path = pendingPath, isVisible else {
      pendingPath = nil
      return
    }
    pendingPath = nil
    let url = URL(fileURLWithPath: path)
    // Clear current preview first to cancel any in-progress load
    previewView?.previewItem = nil
    previewView?.previewItem = url as QLPreviewItem
  }

  func hide() {
    guard let window = qlWindow, window.isVisible else { return }
    // Cancel any pending coalesced update
    NSObject.cancelPreviousPerformRequests(withTarget: self, selector: #selector(applyPendingUpdate), object: nil)
    pendingPath = nil
    if let parent = window.parent {
      parent.removeChildWindow(window)
    }
    window.orderOut(nil)
    previewView?.previewItem = nil
    // Return key focus to Sol's panel
    PanelManager.shared.getWindow()?.makeKey()
  }

  private func setupWindow() {
    let window = QuickLookPanel(
      contentRect: NSRect(x: 0, y: 0, width: 600, height: 450),
      styleMask: [.titled, .closable, .resizable, .miniaturizable, .fullSizeContentView],
      backing: .buffered,
      defer: false
    )
    window.level = .floating
    window.titleVisibility = .hidden
    window.titlebarAppearsTransparent = true
    window.isReleasedWhenClosed = false
    window.hasShadow = true
    window.setFrameAutosaveName("SolQuickLook")

    let preview = QLPreviewView(frame: window.contentView!.bounds, style: .normal)!
    preview.autoresizingMask = [.width, .height]
    window.contentView!.addSubview(preview)

    qlWindow = window
    previewView = preview
  }

  private func positionWindow(relativeTo parentWindow: NSWindow) {
    guard let _ = parentWindow.screen ?? NSScreen.main else { return }

    let qlSize = qlWindow!.frame.size
    let parentFrame = parentWindow.frame

    // Center horizontally with Sol's panel, align top edges
    let x = parentFrame.midX - qlSize.width / 2
    let y = parentFrame.maxY - qlSize.height

    qlWindow!.setFrameOrigin(NSPoint(x: x, y: y))
  }
}
