import Cocoa
import SwiftUI

class MyDelegate: NSObject, NSWindowDelegate {
  var resignHandler: () -> Void

  init(resignHandler: @escaping () -> Void) {
    self.resignHandler = resignHandler
  }

  func windowDidResignKey(_ notification: Notification) {
    resignHandler()
  }

  func windowDidResignMain(_ notification: Notification) {
    resignHandler()
  }
}

class GithubMenuBarController {
  private var statusBarItem: NSStatusItem!
  private var panel: Panel!
  private var delegate: MyDelegate!

  init() {
    statusBarItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
    let contentView = NSHostingView(rootView: StatusBarCustomItem(items: []))
    panel = Panel(contentRect: NSRect(x: 0, y: 0, width: 300, height: 300))
    panel.contentView = contentView
    panel.setOnResignKey {
      DispatchQueue.main.async {
        self.hide()
      }
    }

    if let button = statusBarItem?.button {
      button.target = self
      button.action = #selector(onClick(_:))
      button.attributedTitle = NSAttributedString(
        string: "●",
        attributes: [NSAttributedString.Key.foregroundColor: NSColor.green]
      )
    }
  }

  @objc func onClick(_ sender: AnyObject?) {
    if let button = statusBarItem.button {
      let buttonFrame = button.window?.convertToScreen(button.frame) ?? .zero
      let panelFrame = panel.frame
      let xPos = buttonFrame.origin.x + (buttonFrame.width - panelFrame.width) / 2
      let yPos = buttonFrame.origin.y - panelFrame.height
      panel.setFrameOrigin(NSPoint(x: xPos, y: yPos))
    }
    panel.makeKeyAndOrderFront(nil)
  }

  func hide() {
    panel.orderOut(nil)
  }

  func setTitleColor(_ status: Int) {
    switch status {
    case 0:
      statusBarItem!.button!.attributedTitle = NSAttributedString(
        string: "●",
        attributes: [NSAttributedString.Key.foregroundColor: NSColor.green]
      )
    case 1:
      statusBarItem!.button!.attributedTitle = NSAttributedString(
        string: "●",
        attributes: [NSAttributedString.Key.foregroundColor: NSColor.yellow])
    default:
      statusBarItem!.button!.attributedTitle = NSAttributedString(
        string: "●",
        attributes: [NSAttributedString.Key.foregroundColor: NSColor.red])
    }
    
  }
  
  func setItems(_ items: [Item]) {
    let contentView = NSHostingView(rootView: StatusBarCustomItem(items: items))
    panel = Panel(contentRect: NSRect(x: 0, y: 0, width: 300, height: 300))
    panel.contentView = contentView
    panel.setContentSize(contentView.fittingSize)
    panel.setOnResignKey {
      DispatchQueue.main.async {
        self.hide()
      }
    }
  }

  func remove() {
    if let item = statusBarItem {
      NSStatusBar.system.removeStatusItem(item)
      statusBarItem = nil
    }
  }
}
