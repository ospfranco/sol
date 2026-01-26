import Foundation

class ClipboardHelper {
  static var frontmostApp: (name: String, bundle: String)?
  // Flag to prevent clipboard listener from capturing our own paste operations
  static var isPasting = false

  static func addOnCopyListener(
    _ callback: @escaping (_ pasteboard: NSPasteboard, _ app: (name: String, bundle: String)?) ->
      Void
  ) {
    let pasteboard = NSPasteboard.general
    var changeCount = NSPasteboard.general.changeCount

    NSWorkspace.shared.notificationCenter.addObserver(
      self, selector: #selector(frontmostAppChanged(sender:)),
      name: NSWorkspace.didActivateApplicationNotification, object: nil)

    // TODO find if there is any better way to observe for changes other than continously check if the amount of items has changed
    Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
      if pasteboard.changeCount != changeCount {
        callback(pasteboard, self.frontmostApp)
        changeCount = pasteboard.changeCount
      }
    }
  }

  @objc private static func frontmostAppChanged(sender: NSNotification) {
    if let info = sender.userInfo,
      let content = info[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication,
      let name = content.localizedName,
      let bundle = content.bundleIdentifier,
      let url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundle)
    {
      frontmostApp = (name: name, bundle: url.absoluteString)
    }
  }

  static func insertToFrontmostApp(_ content: String) {
    DispatchQueue.main.async {
      PanelManager.shared.hideWindow()

      let source = CGEventSource(stateID: .hidSystemState)
      // event for key down event:
      let eventKey = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: true)
      // event for key up event:
      let eventKeyUp = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: false)

      var utf16array = Array(content.utf16)

      // set the emoji for the key down event:
      eventKey?.keyboardSetUnicodeString(stringLength: utf16array.count, unicodeString: &utf16array)
      // set the emoji for the key up event:
      eventKeyUp?.keyboardSetUnicodeString(
        stringLength: utf16array.count, unicodeString: &utf16array)
      // post key down event:
      eventKey?.post(tap: CGEventTapLocation.cghidEventTap)
      // post key up event:
      eventKeyUp?.post(tap: CGEventTapLocation.cghidEventTap)
    }
  }

  static func pasteToFrontmostApp(_ content: String) {
    isPasting = true

    DispatchQueue.main.async {
      let pasteboard = NSPasteboard.general
      pasteboard.clearContents()
      pasteboard.setString(content, forType: .string)

      simulatePaste()
    }
  }

  static func pasteImageToFrontmostApp(_ imagePath: String) {
    isPasting = true

    DispatchQueue.main.async {
      guard let image = NSImage(contentsOfFile: imagePath) else {
        print("Failed to load image from path: \(imagePath)")
        isPasting = false
        return
      }

      let pasteboard = NSPasteboard.general
      pasteboard.clearContents()

      if let tiffData = image.tiffRepresentation {
        pasteboard.setData(tiffData, forType: .tiff)
      }

      simulatePaste()
    }
  }

  /// Hides window, waits for previous app to regain focus, then simulates Cmd+V
  private static func simulatePaste() {
    PanelManager.shared.hideWindow()

    // Delay to ensure the previous app has focus before simulating paste
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
      let event1 = CGEvent(keyboardEventSource: nil, virtualKey: 0x09, keyDown: true)
      event1?.flags = CGEventFlags.maskCommand
      event1?.post(tap: CGEventTapLocation.cghidEventTap)

      let event2 = CGEvent(keyboardEventSource: nil, virtualKey: 0x09, keyDown: false)
      event2?.post(tap: CGEventTapLocation.cghidEventTap)

      // Reset flag after clipboard poll interval (1s) plus buffer
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
        isPasting = false
      }
    }
  }
}
