import Foundation
import HotKey

enum Quarter {
  case topLeft
  case topRight
  case bottomLeft
  case bottomRight
}

enum ScreenHalf {
  case top
  case bottom
  case left
  case right
}

enum LastAction {
  case leftHalf
  case leftThird
  case leftTwoThirds
  case rightHalf
  case rightThird
  case rightTwoThirds
  case top
  case bottom
  case bottomLeft
  case bottomRight
  case topLeft
  case topRight
  case fullScreen
  case center
}

class WindowManager {
  public static let sharedInstance = WindowManager()

  private let screenDetector = ScreenDetector()

  private var lastActions: [Int: LastAction] = [:]

  func moveHalf(_ half: ScreenHalf) {
    guard let window = AccessibilityElement.frontmostWindow()
    else {
      NSSound.beep()
      return
    }

    let screens = screenDetector.detectScreens(using: window)

    guard let usableScreens = screens else {
      NSSound.beep()
      return
    }

    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(
      usableScreens.frameOfCurrentScreen)

    var origin = CGPoint(
      x: normalizedScreenFrame.origin.x + normalizedScreenFrame.width / 2,
      y: normalizedScreenFrame.origin.y)
    var size = CGSize(width: normalizedScreenFrame.width / 2, height: normalizedScreenFrame.height)

    guard let identifier = window.getIdentifier() else {
      return
    }

    switch half {
    case .top:
      origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
      size = CGSize(width: normalizedScreenFrame.width, height: normalizedScreenFrame.height / 2)
      lastActions[identifier] = .top

    case .bottom:
      origin = CGPoint(
        x: normalizedScreenFrame.origin.x,
        y: normalizedScreenFrame.origin.y + normalizedScreenFrame.size.height / 2)
      size = CGSize(width: normalizedScreenFrame.width, height: normalizedScreenFrame.height / 2)
      lastActions[identifier] = .bottom

    case .right:
      let screenHalf = normalizedScreenFrame.width / 2
      let screenThird = normalizedScreenFrame.width / 3
      let screenTwoThirds = screenThird * 2

      let middlePoint = normalizedScreenFrame.origin.x + screenHalf
      let twoThirdsPoint = normalizedScreenFrame.origin.x + screenTwoThirds
      let oneThirdPoint = normalizedScreenFrame.origin.x + screenThird

      var targetWidth = screenHalf
      var targetPoint = middlePoint

      let lastAction = lastActions[identifier]
      if lastAction == .rightHalf {
        targetWidth = screenThird
        targetPoint = twoThirdsPoint
        lastActions[identifier] = .rightThird
      } else if lastAction == .rightThird {
        targetWidth = screenTwoThirds
        targetPoint = oneThirdPoint
        lastActions[identifier] = .rightTwoThirds
      } else {
        lastActions[identifier] = .rightHalf
      }

      origin = CGPoint(x: targetPoint, y: normalizedScreenFrame.origin.y)
      size = CGSize(width: targetWidth, height: normalizedScreenFrame.height)

    case .left:
      guard let identifier = window.getIdentifier() else {
        return
      }

      let screenHalf = normalizedScreenFrame.width / 2
      let screenThird = normalizedScreenFrame.width / 3
      let screenTwoThirds = screenThird * 2

      var targetWidth = screenHalf

      let lastAction = lastActions[identifier]
      if lastAction == .leftHalf {
        targetWidth = screenThird
        lastActions[identifier] = .leftThird
      } else if lastAction == .leftThird {
        targetWidth = screenTwoThirds
        lastActions[identifier] = .leftTwoThirds
      } else {
        lastActions[identifier] = .leftHalf
      }

      origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
      size = CGSize(width: targetWidth, height: normalizedScreenFrame.height)
    }

    window.setRectOf(CGRect(origin: origin, size: size))
  }

  func moveQuarter(_ corner: Quarter) {
    guard let window = AccessibilityElement.frontmostWindow()
    else {
      NSSound.beep()
      return
    }

    let screens = screenDetector.detectScreens(using: window)

    guard let usableScreens = screens else {
      NSSound.beep()
      print("Unable to obtain usable screens")
      return
    }

    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(
      usableScreens.frameOfCurrentScreen)
    guard let identifier = window.getIdentifier() else {
      return
    }

    var origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)

    switch corner {
    case .bottomLeft:
      origin = CGPoint(
        x: normalizedScreenFrame.origin.x,
        y: normalizedScreenFrame.origin.y + normalizedScreenFrame.height / 2)
      lastActions[identifier] = .bottomLeft

    case .bottomRight:
      origin = CGPoint(
        x: normalizedScreenFrame.origin.x + normalizedScreenFrame.width / 2,
        y: normalizedScreenFrame.origin.y + normalizedScreenFrame.height / 2)
      lastActions[identifier] = .bottomRight

    case .topLeft:
      origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
      lastActions[identifier] = .topLeft

    case .topRight:
      origin = CGPoint(
        x: normalizedScreenFrame.origin.x + normalizedScreenFrame.width / 2,
        y: normalizedScreenFrame.origin.y)
      lastActions[identifier] = .topRight
    }

    let size = CGSize(
      width: normalizedScreenFrame.width / 2, height: normalizedScreenFrame.height / 2)

    window.setRectOf(CGRect(origin: origin, size: size))
  }

  func fullscreen() {
    guard let window = AccessibilityElement.frontmostWindow() else {
      NSSound.beep()
      return
    }

    guard let identifier = window.getIdentifier() else {
      return
    }

    let screens = screenDetector.detectScreens(using: window)

    guard let usableScreens = screens else {
      NSSound.beep()
      print("Unable to obtain usable screens")
      return
    }
    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(
      usableScreens.frameOfCurrentScreen)

    let origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
    let size = CGSize(width: normalizedScreenFrame.width, height: normalizedScreenFrame.height)

    lastActions[identifier] = .fullScreen

    window.setRectOf(CGRect(origin: origin, size: size))
  }

  func moveToNextScreen() {
    guard let window = AccessibilityElement.frontmostWindow() else {
      NSSound.beep()
      return
    }

    guard let identifier = window.getIdentifier() else {
      return
    }

    let screens = screenDetector.detectScreens(using: window)

    guard let usableScreens = screens else {
      NSSound.beep()
      print("Unable to obtain usable screens")
      return
    }

    guard let targetScreen = usableScreens.adjacentScreens?.next else {
      NSSound.beep()
      return
    }

    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(targetScreen.frame)

    let origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
    let size = CGSize(width: normalizedScreenFrame.width, height: normalizedScreenFrame.height)

    lastActions[identifier] = nil
    window.setRectOf(CGRect(origin: origin, size: size))
  }

  func moveToPrevScreen() {
    guard let window = AccessibilityElement.frontmostWindow() else {
      NSSound.beep()
      return
    }

    guard let identifier = window.getIdentifier() else {
      return
    }

    let screens = screenDetector.detectScreens(using: window)

    guard let usableScreens = screens else {
      NSSound.beep()
      print("Unable to obtain usable screens")
      return
    }

    guard let targetScreen = usableScreens.adjacentScreens?.prev else {
      NSSound.beep()
      return
    }

    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(targetScreen.frame)

    let origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
    let size = CGSize(width: normalizedScreenFrame.width, height: normalizedScreenFrame.height)

    lastActions[identifier] = nil

    window.setRectOf(CGRect(origin: origin, size: size))
  }

  func center() {
    guard let window = AccessibilityElement.frontmostWindow() else {
      NSSound.beep()
      return
    }

    guard let identifier = window.getIdentifier() else {
      return
    }

    let screens = screenDetector.detectScreens(using: window)

    guard let usableScreens = screens else {
      NSSound.beep()
      print("Unable to obtain usable screens")
      return
    }

    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(
      usableScreens.frameOfCurrentScreen)
    let origin = CGPoint(
      x: normalizedScreenFrame.origin.x
        + (normalizedScreenFrame.width - window.rectOfElement().width) / 2,
      y: normalizedScreenFrame.origin.y
        + (normalizedScreenFrame.height - window.rectOfElement().height) / 2
    )
    let size = CGSize(width: window.rectOfElement().width, height: window.rectOfElement().height)

    window.setRectOf(CGRect(origin: origin, size: size))

    lastActions[identifier] = .center
  }

  func moveFrontmostToPreviousSpace() {
    PanelManager.shared.hideWindow()
    guard let window = AccessibilityElement.frontmostWindow() else {
      NSSound.beep()
      return
    }

    // Ensure mouse position restoration
    let originalMouseLocation = CGEvent(source: nil)?.location
    defer {
      if let position = originalMouseLocation {
        CGWarpMouseCursorPosition(position)
      }
    }

    // More reliable window detection
    let windowFrame = window.rectOfElement()
    let titleBarPosition = CGPoint(
      x: windowFrame.origin.x + windowFrame.width / 2,  // Center of title bar
      y: windowFrame.origin.y + 5  // Slightly into title bar
    )

    // Create a mouse down event at the title bar
    let mouseDown = CGEvent(
      mouseEventSource: nil, mouseType: .leftMouseDown,
      mouseCursorPosition: titleBarPosition, mouseButton: .left)
    mouseDown?.post(tap: .cghidEventTap)

    // Short pause to ensure the window is grabbed
    usleep(100000)  // 0.1 seconds

    let script = """
      tell application "System Events"
          key code 123 using control down
      end tell
      """

    _ = AppleScriptHelper.runAppleScript(script)

    // Short pause to ensure space switching completes
    usleep(300000)  // 0.3 seconds

    // Release the mouse
    let mouseUp = CGEvent(
      mouseEventSource: nil, mouseType: .leftMouseUp,
      mouseCursorPosition: titleBarPosition, mouseButton: .left)
    mouseUp?.post(tap: .cghidEventTap)
  }

  func moveFrontmostToNextSpace() {
    PanelManager.shared.hideWindow()
    guard let window = AccessibilityElement.frontmostWindow() else {
      NSSound.beep()
      return
    }

    // Ensure mouse position restoration
    let originalMouseLocation = CGEvent(source: nil)?.location
    defer {
      if let position = originalMouseLocation {
        CGWarpMouseCursorPosition(position)
      }
    }

    // More reliable window detection
    let windowFrame = window.rectOfElement()
    let titleBarPosition = CGPoint(
      x: windowFrame.origin.x + windowFrame.width / 2,  // Center of title bar
      y: windowFrame.origin.y + 5  // Slightly into title bar
    )

    // Create a mouse down event at the title bar
    let mouseDown = CGEvent(
      mouseEventSource: nil, mouseType: .leftMouseDown,
      mouseCursorPosition: titleBarPosition, mouseButton: .left)
    mouseDown?.post(tap: .cghidEventTap)

    // Short pause to ensure the window is grabbed
    usleep(100000)  // 0.1 seconds

    let script = """
      tell application "System Events"
          key code 124 using control down
      end tell
      """

    let _ = AppleScriptHelper.runAppleScript(script)

    // Short pause to ensure space switching completes
    usleep(300000)  // 0.3 seconds

    // // Release the mouse
    let mouseUp = CGEvent(
      mouseEventSource: nil, mouseType: .leftMouseUp,
      mouseCursorPosition: titleBarPosition, mouseButton: .left)
    mouseUp?.post(tap: .cghidEventTap)
  }
}
