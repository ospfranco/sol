import Foundation

final class Overlay: NSWindow, NSWindowDelegate {
  init(contentRect: NSRect, backing: NSWindow.BackingStoreType, defer flag: Bool) {
    super.init(
      contentRect: contentRect,
      styleMask: [.borderless],
      backing: backing,
      defer: flag
    )

    self.level = .mainMenu + 2
    self.backgroundColor = .black
    self.ignoresMouseEvents = true
  }

  override func constrainFrameRect(_ frameRect: NSRect, to screen: NSScreen?) -> NSRect {
    return frameRect
  }
}
