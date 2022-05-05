import HotKey

class WindowManager {
  public static var sharedInstance = WindowManager()

  private let screenDetector = ScreenDetector()
  private let rightSideScreenHotKey = HotKey(key: .rightArrow, modifiers: [.option, .control])
  private let leftSideScreenHotKey = HotKey(key: .leftArrow, modifiers: [.option, .control])
  private let fullScreenHotKey = HotKey(key: .return, modifiers: [.option, .control])
  private let moveToNextScreenHotKey = HotKey(key: .rightArrow, modifiers: [.option, .control, .command])
  private let moveToPrevScreenHotKey = HotKey(key: .leftArrow, modifiers: [.option, .control, .command])

  required init() {
    rightSideScreenHotKey.keyDownHandler = moveRight
    leftSideScreenHotKey.keyDownHandler = moveLeft
    fullScreenHotKey.keyDownHandler = fullscreen
    moveToNextScreenHotKey.keyDownHandler = moveToNextScreen
  }

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

    let origin = CGPoint(x: normalizedScreenFrame.origin.x + normalizedScreenFrame.width / 2, y: normalizedScreenFrame.origin.y)
    let size = CGSize(width: normalizedScreenFrame.width / 2, height: normalizedScreenFrame.height)

    frontmostWindowElement.setRectOf(CGRect(origin: origin, size: size))
  }

  func moveLeft() {
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

    let origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
    let size = CGSize(width: normalizedScreenFrame.width / 2, height: normalizedScreenFrame.height)

    frontmostWindowElement.setRectOf(CGRect(origin: origin, size: size))
  }

  func fullscreen() {
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

    let origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
    let size = CGSize(width: normalizedScreenFrame.width, height: normalizedScreenFrame.height)

    frontmostWindowElement.setRectOf(CGRect(origin: origin, size: size))
  }

  func moveToNextScreen() {
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

    guard let targetScreen = usableScreens.adjacentScreens?.next else {
      NSSound.beep()
      return
    }

    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(targetScreen.frame)

    let origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
    let size = CGSize(width: normalizedScreenFrame.width, height: normalizedScreenFrame.height)

    frontmostWindowElement.setRectOf(CGRect(origin: origin, size: size))
  }

  func moveToPrevScreen() {
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

    guard let targetScreen = usableScreens.adjacentScreens?.prev else {
      NSSound.beep()
      return
    }

    let normalizedScreenFrame = AccessibilityElement.normalizeCoordinatesOf(targetScreen.frame)

    let origin = CGPoint(x: normalizedScreenFrame.origin.x, y: normalizedScreenFrame.origin.y)
    let size = CGSize(width: normalizedScreenFrame.width, height: normalizedScreenFrame.height)

    frontmostWindowElement.setRectOf(CGRect(origin: origin, size: size))
  }
}

struct Window {
  let id: Int
  let rect: CGRect
}
