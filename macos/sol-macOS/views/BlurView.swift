import Cocoa

class BlurView: NSVisualEffectView {
  @objc var borderRadius: Double = 0
  @objc var inViewBlur: Bool = false
  @objc var disabled: Bool = false
  @objc var materialName: String = "windowBackground"

  override var isFlipped: Bool {
    return true
  }

  override func didSetProps(_: [String]!) {
    if disabled {
      material = .fullScreenUI
      blendingMode = .withinWindow
      return
    }

    layer?.cornerRadius = borderRadius
    if materialName == "windowBackground" {
      material = .windowBackground
    } else if materialName == "menu" {
      material = .menu
    } else if materialName == "sidebar" {
      material = .sidebar
    } else if materialName == "header" {
      material = .headerView
    } else if materialName == "sheet" {
      material = .sheet
    } else if materialName == "popover" {
      material = .popover
    } else if materialName == "hudWindow" {
      material = .hudWindow
    } else if materialName == "fullScreenUI" {
      material = .fullScreenUI
    }
  }

  override func convert(_ point: NSPoint, from _: NSView?) -> NSPoint {
    return NSPoint(x: point.x, y: frame.height - point.y)
  }

  override init(frame: CGRect) {
    super.init(frame: frame)

    if disabled {
      material = .fullScreenUI
      blendingMode = .withinWindow
      return
    }

    if materialName == "windowBackground" {
      material = .windowBackground
    } else if materialName == "menu" {
      material = .menu
    } else if materialName == "sidebar" {
      material = .sidebar
    } else if materialName == "header" {
      material = .headerView
    } else if materialName == "sheet" {
      material = .sheet
    } else if materialName == "popover" {
      material = .popover
    } else if materialName == "hudWindow" {
      material = .hudWindow
    } else if materialName == "fullScreenUI" {
      material = .fullScreenUI
    }

    wantsLayer = true
    layer?.cornerRadius = borderRadius
    layer?.masksToBounds = true
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
  }
}

@objc(BlurViewManager)
class BlurViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> NSView! {
    return BlurView()
  }
}
