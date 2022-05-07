import Foundation

class EmojiHelper {
  static let sharedInstace = EmojiHelper()

  static func pasteEmojiToFrontmostApp(emoji: String) {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      appDelegate?.hideWindow()

      let pasteboard = NSPasteboard.general
      pasteboard.declareTypes([.string], owner: nil)

      let previousValue = pasteboard.string(forType: .string)
      pasteboard.setString(emoji, forType: .string)

      AppleScriptHelper.runAppleScript("tell application \"System Events\" to keystroke \"v\" using command down");

      if(previousValue != nil) {
        pasteboard.setString(previousValue!, forType: .string)
      }

    }
  }
}
