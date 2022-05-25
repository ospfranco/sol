import Foundation

class ClipboardHelper {

  static func addOnPasteListener(_ onPaste: @escaping (_ pasteboard:NSPasteboard) -> Void) {
    let pasteboard = NSPasteboard.general
    var changeCount = NSPasteboard.general.changeCount
    Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { _ in
      if pasteboard.changeCount != changeCount {
        onPaste(pasteboard)
        changeCount = pasteboard.changeCount
      }
    }
  }

  static func insertToFrontmostApp(_ content: String) {
    DispatchQueue.main.async {
      appDelegate?.hideWindow()

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
      appDelegate?.hideWindow()

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
