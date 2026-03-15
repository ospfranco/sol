import Cocoa
import Quartz

class QuickLookManager: NSObject, QLPreviewPanelDataSource {
  static let shared = QuickLookManager()

  private var currentURL: NSURL?
  private var pendingPath: String?
  /// Prevents rapid reloadData() from overwhelming QuickLook's XPC service
  private var isLoading = false
  private var queuedPath: String?
  private var observingPanelKey = false
  /// Prevents rapid toggle (Cmd+Y spam) from overwhelming QLPreviewPanel
  private var toggleCooldown = false
  /// Persists across hide/show so native Cmd+Y can re-show without JS round-trip
  private(set) var lastPath: String?
  /// True from show() until forceHide(). ESC uses this to detect a stuck panel
  /// even when isVisible returns false during a freeze.
  private(set) var active = false
  /// Global ESC monitor — works even when app loses focus due to QL freeze
  private var globalEscMonitor: Any?

  private var panelReady = false

  override init() {
    super.init()
    // Pre-warm: create the QLPreviewPanel singleton and cache a reference.
    // This forces XPC service setup to happen now (at app startup) instead of
    // blocking the main thread on the first Cmd+Y press.
    DispatchQueue.main.async { [weak self] in
      _ = QLPreviewPanel.shared()
      self?.panelReady = true
    }
  }

  var isVisible: Bool {
    return QLPreviewPanel.sharedPreviewPanelExists() && QLPreviewPanel.shared().isVisible
  }

  func toggle(path: String) {
    guard !toggleCooldown else { return }
    toggleCooldown = true
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
      self?.toggleCooldown = false
    }

    lastPath = path
    if isVisible {
      hide()
    } else {
      show(path: path)
    }
  }

  func show(path: String) {
    lastPath = path
    active = true
    currentURL = NSURL(fileURLWithPath: path)

    if !panelReady {
      DispatchQueue.main.async { [weak self] in
        self?.presentPanel()
      }
      return
    }
    presentPanel()
  }

  private func presentPanel() {
    guard currentURL != nil else { return }
    let panel = QLPreviewPanel.shared()!
    panelReady = true
    panel.dataSource = self
    panel.reloadData()
    panel.orderFront(self)

    if !observingPanelKey {
      observingPanelKey = true
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(reclaimKeyWindow),
        name: NSWindow.didBecomeKeyNotification,
        object: panel
      )
    }

    installGlobalEscMonitor()

    DispatchQueue.main.async {
      PanelManager.shared.mainWindow.makeKey()
    }
  }

  private func installGlobalEscMonitor() {
    guard globalEscMonitor == nil else { return }
    globalEscMonitor = NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
      // ESC = 53, Space = 49
      if event.keyCode == 53 || event.keyCode == 49 {
        DispatchQueue.main.async {
          self?.forceHide()
          NSApp.activate(ignoringOtherApps: true)
          PanelManager.shared.mainWindow.makeKey()
        }
      }
    }
  }

  private func removeGlobalEscMonitor() {
    if let monitor = globalEscMonitor {
      NSEvent.removeMonitor(monitor)
      globalEscMonitor = nil
    }
  }

  func update(path: String) {
    lastPath = path
    guard isVisible else { return }
    NSObject.cancelPreviousPerformRequests(withTarget: self, selector: #selector(applyPendingUpdate), object: nil)
    pendingPath = path
    perform(#selector(applyPendingUpdate), with: nil, afterDelay: 0.05)
  }

  @objc private func applyPendingUpdate() {
    guard let path = pendingPath, isVisible else {
      pendingPath = nil
      return
    }
    pendingPath = nil

    if isLoading {
      queuedPath = path
      return
    }

    isLoading = true
    currentURL = NSURL(fileURLWithPath: path)
    QLPreviewPanel.shared().reloadData()
    DispatchQueue.main.async {
      PanelManager.shared.mainWindow.makeKey()
    }

    perform(#selector(loadingCooldownDone), with: nil, afterDelay: 0.3)
  }

  @objc private func loadingCooldownDone() {
    isLoading = false
    if let queued = queuedPath {
      queuedPath = nil
      pendingPath = queued
      applyPendingUpdate()
    }
  }

  @objc private func reclaimKeyWindow() {
    // Always reclaim — QLPreviewPanel can steal key status asynchronously
    // even after hide/orderOut due to pending XPC callbacks.
    PanelManager.shared.mainWindow.makeKey()
  }

  /// Normal hide — preserves lastPath so native Cmd+Y can re-show without JS.
  func hide() {
    guard isVisible else { return }
    NSObject.cancelPreviousPerformRequests(withTarget: self, selector: #selector(applyPendingUpdate), object: nil)
    NSObject.cancelPreviousPerformRequests(withTarget: self, selector: #selector(loadingCooldownDone), object: nil)
    pendingPath = nil
    queuedPath = nil
    isLoading = false
    currentURL = nil
    active = false
    removeGlobalEscMonitor()
    QLPreviewPanel.shared().orderOut(self)
    PanelManager.shared.mainWindow.makeKey()
  }

  /// Nuclear reset — works even if QLPreviewPanel is stuck/frozen.
  /// Bypasses isVisible check, clears all state including lastPath.
  func forceHide() {
    NSObject.cancelPreviousPerformRequests(withTarget: self, selector: #selector(applyPendingUpdate), object: nil)
    NSObject.cancelPreviousPerformRequests(withTarget: self, selector: #selector(loadingCooldownDone), object: nil)
    pendingPath = nil
    queuedPath = nil
    isLoading = false
    toggleCooldown = false
    currentURL = nil
    lastPath = nil
    active = false
    removeGlobalEscMonitor()
    if QLPreviewPanel.sharedPreviewPanelExists() {
      let panel = QLPreviewPanel.shared()!
      panel.dataSource = nil
      panel.orderOut(self)
    }
    PanelManager.shared.getWindow()?.makeKey()
  }

  // MARK: - QLPreviewPanelDataSource

  func numberOfPreviewItems(in panel: QLPreviewPanel!) -> Int {
    return currentURL != nil ? 1 : 0
  }

  func previewPanel(_ panel: QLPreviewPanel!, previewItemAt index: Int) -> (any QLPreviewItem)! {
    return currentURL
  }
}
