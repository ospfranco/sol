import Cocoa

class WindowManager {
  private let screenDetector = ScreenDetector()

  public func moveRight() {
    guard let frontmostWindowElement = AccessibilityElement.frontmostWindow()
    else {
      NSSound.beep()
      return
    }

    let screens = screenDetector.detectScreens(using: frontmostWindowElement)

    guard let usableScreens = screens else {
      NSSound.beep()
      print("Unable to obtain usable screens")
      return
    }

    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(usableScreens.frameOfCurrentScreen)

    let halfPosition = CGPoint(x: normalizedScreenFrame.origin.x + normalizedScreenFrame.width / 2, y: normalizedScreenFrame.origin.y)
    let halfSize = CGSize(width: normalizedScreenFrame.width / 2, height: normalizedScreenFrame.height)

    frontmostWindowElement.set(size: halfSize)
    frontmostWindowElement.set(position: halfPosition)
    frontmostWindowElement.set(size: halfSize)
  }

  public func moveLeft() {
    guard let frontmostWindowElement = AccessibilityElement.frontmostWindow()
            //                      let windowId = frontmostWindowElement.getIdentifier()
    else {
      NSSound.beep()
      return
    }

    let screens = screenDetector.detectScreens(using: frontmostWindowElement)

    guard let usableScreens = screens else {
      NSSound.beep()
      print("Unable to obtain usable screens")
      return
    }
    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(usableScreens.frameOfCurrentScreen)

    let halfPosition = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
    let halfSize = CGSize(width: normalizedScreenFrame.width / 2, height: normalizedScreenFrame.height)

    frontmostWindowElement.set(size: halfSize)
    frontmostWindowElement.set(position: halfPosition)
    frontmostWindowElement.set(size: halfSize)
  }
}

struct Window {
  let id: Int
  let rect: CGRect
}
