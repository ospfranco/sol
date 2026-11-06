import Cocoa

var checks = 0
func expect(_ condition: @autoclosure () -> Bool, _ message: String) {
  precondition(condition(), message)
  checks += 1
}
func screen(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) -> NSScreen {
  NSScreen(CGRect(x: x, y: y, width: w, height: h))
}
// Fixture windows are described in AppKit coordinates; inputs to production
// detection use AX coordinates (top-left of the primary display).
func ax(_ rect: CGRect) -> CGRect {
  CGRect(x: rect.minX, y: NSScreen.screens[0].frame.maxY - rect.maxY,
         width: rect.width, height: rect.height)
}
let detector = ScreenDetector()
let external = screen(0, 0, 2560, 1440)
let builtin = screen(-1440, 0, 1440, 900)
NSScreen.screens = [external, builtin]
NSScreen.main = builtin // Previous Sol screen must not influence detection.
let externalWindow = ax(CGRect(x: 200, y: 200, width: 900, height: 700))
expect(detector.detectScreens(containing: externalWindow)?.currentScreen === external,
       "Window on external display must override the previous Sol screen")
expect(detector.detectScreens(using: AccessibilityElement(externalWindow))?.currentScreen === external,
       "Window-manager AX entry point must retain valid detection")
expect(detector.detectScreens(using: nil) == nil, "Missing AX window must remain unknown")
for invalid: CGRect? in [nil, .zero, .null, .infinite,
                         CGRect(x: CGFloat.nan, y: 0, width: 100, height: 100),
                         CGRect(x: 0, y: 0, width: CGFloat.infinity, height: 100),
                         CGRect(x: 100, y: 100, width: 0, height: 100),
                         CGRect(x: 10000, y: 10000, width: 100, height: 100)] {
  expect(detector.detectScreens(containing: invalid) == nil,
         "Invalid or off-screen window must not select an arbitrary display")
}
for other in [screen(-1440, 0, 1440, 900), screen(2560, 0, 1440, 900),
              screen(0, 1440, 1440, 900), screen(0, -900, 1440, 900)] {
  NSScreen.screens = [external, other]
  let window = ax(other.frame.insetBy(dx: 100, dy: 100))
  expect(detector.detectScreens(containing: window)?.currentScreen === other,
         "Detection must support displays on every side of the primary")
}
NSScreen.screens = [external, builtin]
let spanning = ax(CGRect(x: -200, y: 100, width: 1000, height: 600))
expect(detector.detectScreens(containing: spanning)?.currentScreen === external,
       "A spanning window belongs to the display with the largest overlap")
let touching = ax(CGRect(x: -100, y: 100, width: 100, height: 100))
expect(detector.detectScreens(containing: touching)?.currentScreen === builtin,
       "Touching an edge is not a positive-area intersection")
let detected = detector.detectScreens(containing: externalWindow)!
expect(detected.adjacentScreens?.next === builtin, "Adjacent display must remain available")
NSScreen.screens = [external]
expect(detector.detectScreens(containing: externalWindow)?.adjacentScreens?.next === external,
       "Single-display window cycling must remain available")
expect(detector.detectScreens(containing: .null) == nil, "Invalid bounds also fail on one screen")
NSScreen.screens = []
expect(detector.detectScreens(containing: externalWindow) == nil, "No displays must be safe")

NSScreen.screens = [external, builtin]
let manager = PanelManager()
let panel = Panel.instance!
panel.setFrame(CGRect(x: -1200, y: 100, width: 700, height: 450), display: false)
AccessibilityElement.focusedRect = externalWindow
cursorScreen = builtin
expect(manager.getFrontmostScreen() === external, "Focused window wins over cursor and old panel")
for rect: CGRect? in [nil, .null, .zero] {
  AccessibilityElement.focusedRect = rect
  cursorScreen = external
  expect(manager.getFrontmostScreen() === external, "Unknown window uses cursor, not old panel")
}
cursorScreen = nil
expect(manager.getFrontmostScreen() === external, "Missing cursor uses primary, not NSScreen.main")
AccessibilityElement.focusedRect = externalWindow
manager.showWindow()
expect(panel.screen === external, "Reopening must move the panel from built-in to external")
AccessibilityElement.focusedRect = nil
cursorScreen = builtin
expect(manager.getFrontmostScreen() === external, "A visible key panel stays on its chosen screen")
manager.setHeight(600)
expect(panel.screen === external, "Layout changes must preserve the displayed screen")
manager.hideWindow()
manager.setPreferredScreen(.withMouse)
cursorScreen = external
manager.showWindow()
cursorScreen = builtin
let xBefore = panel.frame.minX
manager.setHeight(500)
expect(panel.frame.minX == xBefore && panel.screen === external,
       "Moving the cursor after opening must not move the panel on resize")
expect(panel.frame.minY == external.visibleFrame.midY - 500 + external.visibleFrame.height * 0.3,
       "Resize must not mix coordinates from two displays")
manager.hideWindow()
manager.showWindow()
expect(panel.screen === builtin, "A new invocation in cursor mode uses the new cursor screen")
manager.hideWindow()
cursorScreen = nil
expect(manager.getPreferredScreen() === external, "Cursor mode also handles a missing cursor screen")
NSScreen.screens = []
expect(manager.getPreferredScreen() == nil, "Missing displays must not fabricate a target")
print("Passed \(checks) screen-selection checks")
