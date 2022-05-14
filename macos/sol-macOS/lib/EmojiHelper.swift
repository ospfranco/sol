import Foundation

class EmojiHelper {
  static let sharedInstace = EmojiHelper()

  static func pasteEmojiToFrontmostApp(emoji: String) {
    DispatchQueue.main.async {
      appDelegate?.hideWindow()

      let source = CGEventSource(stateID: .hidSystemState)
      // event for key down event:
      let eventKey = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: true)
      // event for key up event:
      let eventKeyUp = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: false)

      // split the emoji into an array:
      var utf16array = Array(emoji.utf16)

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
  
  static func pasteToFronMostApp(content: String) {
    DispatchQueue.main.async {
      appDelegate?.hideWindow()

      let pasteboard = NSPasteboard.general
      pasteboard.declareTypes([.string], owner: nil)

      pasteboard.setString(content, forType: .string)

      AppleScriptHelper.runAppleScript("tell application \"System Events\" to keystroke \"v\" using command down");
    }
  }
}
