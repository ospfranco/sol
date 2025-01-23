import Foundation

class ClipboardHelper {
  static var frontmostApp: (name: String, bundle: String)?
  
  static func onCopyListener(_ callback: @escaping (_ pasteboard:NSPasteboard,_ app: (name: String, bundle: String)?) -> Void) {
    let pasteboard = NSPasteboard.general
    var changeCount = NSPasteboard.general.changeCount
    NSWorkspace.shared.notificationCenter.addObserver(self, selector: #selector(activeApp(sender:)), name: NSWorkspace.didActivateApplicationNotification, object: nil)
    
    Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { _ in
      if pasteboard.changeCount != changeCount {
        callback(pasteboard, self.frontmostApp)
        changeCount = pasteboard.changeCount
      }
    }
  }
  
  @objc private static func activeApp(sender: NSNotification) {
      if let info = sender.userInfo,
         let content = info[NSWorkspace.applicationUserInfoKey] as? NSRunningApplication,
          let name = content.localizedName,
          let bundle = content.bundleIdentifier,
//         let url = content.executableURL?.absoluteString
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
      eventKeyUp?.keyboardSetUnicodeString(stringLength: utf16array.count, unicodeString: &utf16array)
      // post key down event:
      eventKey?.post(tap: CGEventTapLocation.cghidEventTap)
      // post key up event:
      eventKeyUp?.post(tap: CGEventTapLocation.cghidEventTap)
    }
  }
  
  static func pasteToFrontmostApp(_ content: String) {
    DispatchQueue.main.async {
      PanelManager.shared.hideWindow()

      let pasteboard = NSPasteboard.general
      pasteboard.declareTypes([.string], owner: nil)

      pasteboard.setString(content, forType: .string)

      let event1 = CGEvent(keyboardEventSource: nil, virtualKey: 0x09, keyDown: true); // cmd-v down
      event1?.flags = CGEventFlags.maskCommand;
      event1?.post(tap: CGEventTapLocation.cghidEventTap);

      let event2 = CGEvent(keyboardEventSource: nil, virtualKey: 0x09, keyDown: false) // cmd-v up
                                                                                       //    event2?.flags = CGEventFlags.maskCommand
      event2?.post(tap: CGEventTapLocation.cghidEventTap)
    }
  }
}
