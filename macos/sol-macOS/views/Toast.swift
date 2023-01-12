import Foundation
//import AppKit
//
//struct VisualEffectView: NSViewRepresentable {
//    func makeNSView(context: Context) -> NSVisualEffectView {
//        let view = NSVisualEffectView()
//
//        view.blendingMode = .behindWindow    // << important !!
//        view.isEmphasized = true
//      view.material = .popover
//        return view
//    }
//
//    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
//    }
//}

final class Toast: NSWindow, NSWindowDelegate {
//  public var visualEffect: NSVisualEffectView!
  
  init(contentRect: NSRect, backing: NSWindow.BackingStoreType, defer flag: Bool) {
    super.init(
      contentRect: contentRect,
      styleMask: [.titled, .fullSizeContentView, .nonactivatingPanel],
      backing: backing,
      defer: flag
    )

    self.level = .floating
    self.collectionBehavior.insert(.fullScreenAuxiliary) // Allows the pannel to appear in a fullscreen space
    self.collectionBehavior.insert(.canJoinAllSpaces)
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.isMovable = false
    self.isMovableByWindowBackground = false
    self.isReleasedWhenClosed = false
    self.isOpaque = false
  }
}
