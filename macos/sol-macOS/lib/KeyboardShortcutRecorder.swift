import Cocoa

class KeyboardShortcutRecorder {
  private var monitor: Any?
  private var isActive = false
  var onShortcut: (([String]) -> Void)?

  func startRecording() {
    guard !isActive else { return }
    isActive = true
    monitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
      guard let self = self else { return event }
      let keys = self.keysFrom(event: event)
      self.onShortcut?(keys)
      // Return nil to prevent the event from propagating, or event to allow it
      return nil
    }
  }

  func stopRecording() {
    if let monitor = monitor {
      NSEvent.removeMonitor(monitor)
      self.monitor = nil
    }
    isActive = false
  }

  private func keysFrom(event: NSEvent) -> [String] {
    var keys: [String] = []
    if event.modifierFlags.contains(.command) { keys.append("⌘") }
    if event.modifierFlags.contains(.option) { keys.append("⌥") }
    if event.modifierFlags.contains(.control) { keys.append("⌃") }
    if event.modifierFlags.contains(.shift) { keys.append("⇧") }
    if let chars = event.charactersIgnoringModifiers {
      keys.append(chars.uppercased())
    }
    return keys
  }
}
