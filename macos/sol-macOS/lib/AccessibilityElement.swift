import Foundation
import Cocoa
import Carbon

let kAXEnhancedUserInterface: String = "AXEnhancedUserInterface"

class AccessibilityElement {
  static let systemWideElement = AccessibilityElement(AXUIElementCreateSystemWide())

  private let underlyingElement: AXUIElement

  required init(_ axUIElement: AXUIElement) {
    self.underlyingElement = axUIElement
  }

  static func frontmostApplication() -> AccessibilityElement? {
    guard let frontmostApplication: NSRunningApplication = NSWorkspace.shared.frontmostApplication else {
      return nil }
    let underlyingElement = AXUIElementCreateApplication(frontmostApplication.processIdentifier)
    let frontmostApplicationElement = AccessibilityElement(underlyingElement)
    return frontmostApplicationElement
  }

  static func frontmostWindow() -> AccessibilityElement? {
    guard let appElement = AccessibilityElement.frontmostApplication() else {
      print("Failed to find the application that currently has focus.")
      return nil
    }

    let focusedAttr = NSAccessibility.Attribute.focusedWindow as CFString
    if let frontElement = appElement.withAttribute(focusedAttr) {
      return frontElement
    }

    if let firstWindow = appElement.allWindows().first {
      return firstWindow
    }

    return nil
  }

//  static func allWindowsForPIDs(_ pids: [Int]) -> [AccessibilityElement] {
//    let apps = pids.map {
//      AccessibilityElement(AXUIElementCreateApplication(pid_t($0)))
//    }
//    var windows = [AccessibilityElement]()
//
//    for app in apps {
//      var rawValue: AnyObject? = nil
//      if AXUIElementCopyAttributeValue(app.underlyingElement,
//                                       NSAccessibility.Attribute.windows as CFString,
//                                       &rawValue) == .success {
//        windows.append(contentsOf: (rawValue as! [AXUIElement]).map { AccessibilityElement($0) })
//      }
//    }
//
//    return windows
//  }

  func allWindows() -> [AccessibilityElement] {
    var windows = [AccessibilityElement]()

    guard let app = application() else { return windows }
    var rawValue: AnyObject? = nil
    if AXUIElementCopyAttributeValue(app.underlyingElement,
                                     NSAccessibility.Attribute.windows as CFString,
                                     &rawValue) == .success {
      windows.append(contentsOf: (rawValue as! [AXUIElement]).map { AccessibilityElement($0) })
    }

    return windows
  }

  func getIdentifier() -> Int? {
    var identifier: CGWindowID = 0
    _AXUIElementGetWindow(underlyingElement, &identifier)
    if identifier != 0 {
      return Int(identifier)
    }

    if let windowInfo = CGWindowListCopyWindowInfo(.optionOnScreenOnly, 0) as? Array<Dictionary<String,Any>> {
      let pid = getPid()
      let rect = rectOfElement()

      let windowsOfSameApp = windowInfo.filter { (infoDict) -> Bool in
        infoDict[kCGWindowOwnerPID as String] as? pid_t == pid
      }

      let matchingWindows = windowsOfSameApp.filter { (infoDict) -> Bool in
        if let bounds = infoDict[kCGWindowBounds as String] as? [String: CGFloat] {
          if bounds["X"] == rect.origin.x
              && bounds["Y"] == rect.origin.y
              && bounds["Height"] == rect.height
              && bounds["Width"] == rect.width {
            return true
          }
        }
        return false
      }

      // Take the first match because there's no real way to guarantee which window we're actually getting
      if let firstMatch = matchingWindows.first {
        return firstMatch[kCGWindowNumber as String] as? Int
      }
    }
//    Logger.log("Unable to obtain window id")
    return nil
  }

  private func role() -> String? {
    return self.value(for: .role)
  }

  private func application() -> AccessibilityElement? {
    if role() == kAXApplicationRole { return self }
    return AccessibilityElement(AXUIElementCreateApplication(getPid()))
  }

  func withAttribute(_ attribute: CFString) -> AccessibilityElement? {
    var copiedUnderlyingElement: AnyObject?
    let result: AXError = AXUIElementCopyAttributeValue(underlyingElement, attribute, &copiedUnderlyingElement)
    if result == .success {
      if let copiedUnderlyingElement = copiedUnderlyingElement {
        return AccessibilityElement(copiedUnderlyingElement as! AXUIElement)
      }
    }
    print("Unable to obtain accessibility element \(result)")
    return nil
  }

  func rectOfElement() -> CGRect {
    guard let position: CGPoint = getPosition(),
          let size: CGSize = getSize()
    else {
      return CGRect.null
    }
    return CGRect(x: position.x, y: position.y, width: size.width, height: size.height)
  }

  func getPid() -> pid_t {
    var pid: pid_t = 0
    AXUIElementGetPid(self.underlyingElement, &pid)
    return pid
  }

  private func getPosition() -> CGPoint? {
    return self.value(for: .position)
  }

  func set(position: CGPoint) {
    if let value = AXValue.from(value: position, type: .cgPoint) {
      //      print("AX position proposed: \(position.debugDescription), result: \(getPosition()?.debugDescription ?? "N/A")")
      AXUIElementSetAttributeValue(self.underlyingElement, kAXPositionAttribute as CFString, value)
    }
  }

  private func getSize() -> CGSize? {
    return self.value(for: .size)
  }

  func set(size: CGSize) {
    if let value = AXValue.from(value: size, type: .cgSize) {
//      print("AX sizing proposed: \(size.debugDescription), result: \(getSize()?.debugDescription ?? "N/A")")
      AXUIElementSetAttributeValue(self.underlyingElement, kAXSizeAttribute as CFString, value)
    }
  }

  private func rawValue(for attribute: NSAccessibility.Attribute) -> AnyObject? {
    var rawValue: AnyObject?
    let error = AXUIElementCopyAttributeValue(self.underlyingElement, attribute.rawValue as CFString, &rawValue)
    return error == .success ? rawValue : nil
  }

  private func value(for attribute: NSAccessibility.Attribute) -> Self? {
    if let rawValue = self.rawValue(for: attribute), CFGetTypeID(rawValue) == AXUIElementGetTypeID() {
      return type(of: self).init(rawValue as! AXUIElement)
    }

    return nil
  }

  private func value(for attribute: NSAccessibility.Attribute) -> String? {
    return self.rawValue(for: attribute) as? String
  }

  private func value<T>(for attribute: NSAccessibility.Attribute) -> T? {
    if let rawValue = self.rawValue(for: attribute), CFGetTypeID(rawValue) == AXValueGetTypeID() {
      return (rawValue as! AXValue).toValue()
    }

    return nil
  }

  static func normalizeCoordinatesOf(_ rect: CGRect) -> CGRect {
    var normalizedRect = rect
    let frameOfScreenWithMenuBar = NSScreen.screens[0].frame as CGRect
    normalizedRect.origin.y = frameOfScreenWithMenuBar.height - rect.maxY
    return normalizedRect
  }

  func setRectOf(_ rect: CGRect) {
    let app = application()
    var enhancedUserInterfaceEnabled: Bool? = nil

    if let app = app {
      enhancedUserInterfaceEnabled = app.isEnhancedUserInterfaceEnabled()
      if enhancedUserInterfaceEnabled == true {
        print("AXEnhancedUserInterface was enabled, will disable before resizing")
        AXUIElementSetAttributeValue(app.underlyingElement, kAXEnhancedUserInterface as CFString, kCFBooleanFalse)
      }
    }

    set(size: rect.size)
    set(position: rect.origin)
    set(size: rect.size)

    // If "enhanced user interface" was originally enabled for the app, turn it back on
    if let app = app, enhancedUserInterfaceEnabled == true {
      AXUIElementSetAttributeValue(app.underlyingElement, kAXEnhancedUserInterface as CFString, kCFBooleanTrue)
    }
  }

  func isEnhancedUserInterfaceEnabled() -> Bool? {
    var rawValue: AnyObject?
    let error = AXUIElementCopyAttributeValue(self.underlyingElement, kAXEnhancedUserInterface as CFString, &rawValue)

    if error == .success && CFGetTypeID(rawValue) == CFBooleanGetTypeID() {
      return CFBooleanGetValue((rawValue as! CFBoolean))
    }

    return nil
  }
}

extension AccessibilityElement {
  private static func PIDsWithWindows() -> Set<Int> {
    let options = CGWindowListOption(arrayLiteral: CGWindowListOption.excludeDesktopElements, CGWindowListOption.optionOnScreenOnly)
    let windowListInfo = CGWindowListCopyWindowInfo(options, kCGNullWindowID)
    guard let infoList = (windowListInfo as NSArray?) as? [[String: AnyObject]] else { return [] }
    var PIDs: Set<Int> = []

    for w in infoList {
      if let ownerPID = w[kCGWindowOwnerPID as String] as? Int {
        PIDs.insert(ownerPID)
      }
    }

    return PIDs
  }

  static func allWindowsForPIDs(_ pids: [Int]) -> [AccessibilityElement] {
    let apps = pids.map {
      AccessibilityElement(AXUIElementCreateApplication(pid_t($0)))
    }
    var windows = [AccessibilityElement]()

    for app in apps {
      var rawValue: AnyObject? = nil
      if AXUIElementCopyAttributeValue(app.underlyingElement,
                                       NSAccessibility.Attribute.windows as CFString,
                                       &rawValue) == .success {
        windows.append(contentsOf: (rawValue as! [AXUIElement]).map { AccessibilityElement($0) })
      }
    }

    return windows
  }

  static func allWindows() -> [AccessibilityElement] {
    allWindowsForPIDs([Int](PIDsWithWindows()))
  }

//  static func todoWindow() -> AccessibilityElement? {
//    let apps = NSWorkspace.shared.runningApplications
//
//    for app in apps {
//      if app.bundleIdentifier == Defaults.todoApplication.value {
//        let windows = allWindowsForPIDs([Int(app.processIdentifier)])
//        if(windows.count > 0) {
//          return windows[0]
//        }
//      }
//    }
//
//    return nil
//  }
}

extension AXValue {
  func toValue<T>() -> T? {
    let pointer = UnsafeMutablePointer<T>.allocate(capacity: 1)
    let success = AXValueGetValue(self, AXValueGetType(self), pointer)
    return success ? pointer.pointee : nil
  }

  static func from<T>(value: T, type: AXValueType) -> AXValue? {
    let pointer = UnsafeMutablePointer<T>.allocate(capacity: 1)
    pointer.pointee = value
    return AXValueCreate(type, pointer)
  }
}
