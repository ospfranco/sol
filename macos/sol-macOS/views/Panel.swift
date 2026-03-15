import Foundation

let appDelegate = NSApp.delegate as? AppDelegate

final class Panel: NSPanel, NSWindowDelegate {
  init(contentRect: NSRect) {
    super.init(
      contentRect: contentRect,
      styleMask: [.titled, .fullSizeContentView, .nonactivatingPanel],
      backing: .buffered,
      defer: false
    )

    self.hasShadow = true
    self.level = .floating
    self.collectionBehavior.insert(.fullScreenAuxiliary)
    self.collectionBehavior.insert(.canJoinAllSpaces)
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.isMovableByWindowBackground = true
    self.isReleasedWhenClosed = false
    self.isOpaque = false
    self.delegate = self
    self.backgroundColor = NSColor.windowBackgroundColor.withAlphaComponent(0.2)

    let effectView = NSVisualEffectView(
      frame: .zero
    )
    effectView.autoresizingMask = [.width, .height]
    effectView.material = .headerView
    effectView.blendingMode = .behindWindow
    effectView.state = .active

    self.contentView = effectView
    self.contentView!.wantsLayer = true
  }

  override var canBecomeKey: Bool {
    return true
  }

  override var canBecomeMain: Bool {
    return true
  }

  func windowDidResignKey(_ notification: Notification) {
    DispatchQueue.main.async {
      if QuickLookManager.shared.isVisible { return }
      // Only soft-hide if the window is still visible (user clicked outside).
      // hideWindow() also triggers windowDidResignKey via orderOut(); by the
      // time this async block runs the window is already hidden, so skip to
      // avoid overwriting wasSoftHidden with true after a hard hide.
      guard PanelManager.shared.mainWindow.isVisible else { return }
      // Soft hide preserves JS state (query, selected index, focused widget)
      // so re-opening the window resumes where the user left off.
      PanelManager.shared.softHideWindow()
    }
  }
}
