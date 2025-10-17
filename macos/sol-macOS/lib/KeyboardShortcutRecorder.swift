import Carbon
import Cocoa

class KeyboardShortcutRecorder {
  private var isActive = false
  var onShortcut: (([String]) -> Void)?
  private var eventTap: CFMachPort?
  private var runLoopSource: CFRunLoopSource?

  func startRecording() {
    guard !isActive else { return }
    isActive = true

    // Create a CGEvent tap to intercept events before system shortcuts
    let mask = (1 << CGEventType.keyDown.rawValue)

    guard
      let tap = CGEvent.tapCreate(
        tap: .cgSessionEventTap,
        place: .headInsertEventTap,
        options: .defaultTap,
        eventsOfInterest: CGEventMask(mask),
        callback: { (proxy, type, event, refcon) -> Unmanaged<CGEvent>? in
          let recorder = Unmanaged<KeyboardShortcutRecorder>.fromOpaque(refcon!)
            .takeUnretainedValue()
          return recorder.handleEvent(proxy: proxy, type: type, event: event)
        },
        userInfo: Unmanaged.passUnretained(self).toOpaque()
      )
    else {
      print("Failed to create event tap for keyboard shortcut recording")
      return
    }

    eventTap = tap
    runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
    CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
    CGEvent.tapEnable(tap: tap, enable: true)
  }

  func stopRecording() {
    if let tap = eventTap {
      CGEvent.tapEnable(tap: tap, enable: false)
      CFMachPortInvalidate(tap)
      eventTap = nil
    }

    if let source = runLoopSource {
      CFRunLoopRemoveSource(CFRunLoopGetCurrent(), source, .commonModes)
      runLoopSource = nil
    }

    isActive = false
  }

  private func handleEvent(proxy: CGEventTapProxy, type: CGEventType, event: CGEvent) -> Unmanaged<
    CGEvent
  >? {
    if type == .keyDown {
      // Convert CGEvent to NSEvent to use our existing parsing logic
      if let nsEvent = NSEvent(cgEvent: event) {
        let keys = keysFrom(event: nsEvent)

        // Call the callback directly on main thread if already on main, otherwise dispatch
        self.onShortcut?(keys)
      }

      // Consume the event to prevent it from triggering system shortcuts
      return nil
    }

    return Unmanaged.passUnretained(event)
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
