import Foundation

class PasteboardHelper {
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
}
