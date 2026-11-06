import Cocoa

class ScreenDetector {

  func detectScreens(using frontmostWindowElement: AccessibilityElement?) -> UsableScreens? {
    return detectScreens(containing: frontmostWindowElement?.rectOfElement())
  }

  // Window bounds use the top-left-origin Accessibility/Window Server space.
  // Unknown or off-screen bounds must not silently select Sol's previous screen.
  func detectScreens(containing windowRect: CGRect?) -> UsableScreens? {
    let screens = NSScreen.screens
    guard let firstScreen = screens.first,
          let windowRect = windowRect,
          Self.isUsableWindowRect(windowRect) else { return nil }

    var normalizedRect = windowRect
    normalizedRect.origin.y = firstScreen.frame.maxY - windowRect.maxY
    guard Self.isUsableWindowRect(normalizedRect),
          let sourceScreen = screenContaining(normalizedRect, screens: screens) else { return nil }

    let adjacentScreens = screens.count == 1
      ? AdjacentScreens(prev: firstScreen, next: firstScreen)
      : adjacent(toFrameOfScreen: sourceScreen.frame, screens: order(screens: screens))
    return UsableScreens(currentScreen: sourceScreen, adjacentScreens: adjacentScreens, numScreens: screens.count)
  }

  static func isUsableWindowRect(_ rect: CGRect) -> Bool {
    return !rect.isNull && !rect.isInfinite && !rect.isEmpty
      && rect.origin.x.isFinite && rect.origin.y.isFinite
      && rect.width.isFinite && rect.height.isFinite
      && rect.maxX.isFinite && rect.maxY.isFinite
  }

  private func screenContaining(_ rect: CGRect, screens: [NSScreen]) -> NSScreen? {
    var result: NSScreen?
    var largestIntersectionArea: CGFloat = 0
    for screen in screens {
      let intersection = rect.intersection(screen.frame)
      guard !intersection.isNull && !intersection.isEmpty else { continue }
      let area = intersection.width * intersection.height
      if area > largestIntersectionArea {
        largestIntersectionArea = area
        result = screen
      }
    }
    return result
  }

  func adjacent(toFrameOfScreen frameOfScreen: CGRect, screens: [NSScreen]) -> AdjacentScreens? {
    if screens.count == 2 {
      let otherScreen = screens.first(where: { screen in
        let frame = NSRectToCGRect(screen.frame)
        return !frame.equalTo(frameOfScreen)
      })
      if let otherScreen = otherScreen {
        return AdjacentScreens(prev: otherScreen, next: otherScreen)
      }
    } else if screens.count > 2 {
      let currentScreenIndex = screens.firstIndex(where: { screen in
        let frame = NSRectToCGRect(screen.frame)
        return frame.equalTo(frameOfScreen)
      })
      if let currentScreenIndex = currentScreenIndex {
        let nextIndex = currentScreenIndex == screens.count - 1
        ? 0
        : currentScreenIndex + 1
        let prevIndex = currentScreenIndex == 0
        ? screens.count - 1
        : currentScreenIndex - 1
        return AdjacentScreens(prev: screens[prevIndex], next: screens[nextIndex])
      }
    }

    return nil
  }

  func order(screens: [NSScreen]) -> [NSScreen] {
    let sortedByY = screens.sorted(by: { screen1, screen2 in
      return screen1.frame.origin.y < screen2.frame.origin.y
    })
    let alsoSortedByX = sortedByY.sorted(by: { screen1, screen2 in
      return screen1.frame.origin.x < screen2.frame.origin.x
    })
    return alsoSortedByX
  }

}

struct UsableScreens {
  let currentScreen: NSScreen
  let adjacentScreens: AdjacentScreens?
  let frameOfCurrentScreen: CGRect
  let numScreens: Int

  init(currentScreen: NSScreen, adjacentScreens: AdjacentScreens? = nil, numScreens: Int) {
    self.currentScreen = currentScreen
    self.adjacentScreens = adjacentScreens
    self.frameOfCurrentScreen = currentScreen.frame
    self.numScreens = numScreens
  }
}

struct AdjacentScreens {
  let prev: NSScreen
  let next: NSScreen
}

extension NSRect {
  var isLandscape: Bool { width > height }
}
