import Cocoa

// Only OS/window dependencies are replaced. The runner compiles the actual
// ScreenDetector and PanelManager sources, without creating windows or using AX.
final class NSScreen {
  let frame: CGRect
  var visibleFrame: CGRect { frame }
  init(_ frame: CGRect) { self.frame = frame }
  static var screens: [NSScreen] = []
  static var main: NSScreen?
}

final class AccessibilityElement {
  let rect: CGRect
  init(_ rect: CGRect) { self.rect = rect }
  func rectOfElement() -> CGRect { rect }
  static var focusedRect: CGRect?
  static func frontmostWindowRect() -> CGRect? { focusedRect }
}

var cursorScreen: NSScreen?
func getScreenWithMouse() -> NSScreen? { cursorScreen }

final class Panel {
  static var instance: Panel!
  var frame: CGRect
  var screen: NSScreen? {
    NSScreen.screens.max { lhs, rhs in
      func area(_ screen: NSScreen) -> CGFloat {
        let rect = frame.intersection(screen.frame)
        return rect.isNull ? 0 : rect.width * rect.height
      }
      return area(lhs) < area(rhs)
    }
  }
  var isVisible = false
  var isKeyWindow = false
  var contentView: NSView? = NSView()
  init(contentRect: CGRect) { frame = contentRect; Self.instance = self }
  func setFrameOrigin(_ point: CGPoint) { frame.origin = point }
  func setIsVisible(_ visible: Bool) { isVisible = visible; if !visible { isKeyWindow = false } }
  func makeKeyAndOrderFront(_ sender: Any?) { isKeyWindow = true }
  func setFrame(_ rect: CGRect, display: Bool) { frame = rect }
  func center() {}
}

final class HotKeyManager {
  final class HotKey { var isPaused = true }
  static let shared = HotKeyManager()
  let settingsHotKey = HotKey()
}
final class SolEmitter {
  static let sharedInstance = SolEmitter()
  func onShow(target: String?) {}
  func onHide() {}
}
