import Foundation
import Cocoa
import HotKey
import EventKit
// import LaunchAtLogin

let handledKeys: [UInt16] = [53, 126, 125, 36, 48]
let numberchars: [String] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, NSUserNotificationCenterDelegate  {
  
  var mainWindow: Panel!
  let hotKey = HotKey(key: .space, modifiers: [.command])
  
  func applicationDidFinishLaunching(_ aNotification: Notification) {
    // LaunchAtLogin.isEnabled = true
    hotKey.keyDownHandler = toggleWindow

    let jsCodeLocation: URL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:"main")

    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "sol", initialProperties: nil, launchOptions: nil)
    
    mainWindow = Panel(
      contentRect: NSRect(x: 0, y: 0, width: 750, height: 600),
      backing: .buffered, defer: false)
    
    let origin = CGPoint(x: 0, y: 0)
    let size = CGSize(width: 750, height: 600)
    let frame = NSRect(origin: origin, size: size)
    mainWindow.setFrame(frame, display: false)
    
    mainWindow.contentView!.addSubview(rootView)
    
    rootView.translatesAutoresizingMaskIntoConstraints = false
    rootView.topAnchor.constraint(equalTo: mainWindow.contentView!.topAnchor).isActive = true
    rootView.leadingAnchor.constraint(equalTo: mainWindow.contentView!.leadingAnchor).isActive = true
    rootView.trailingAnchor.constraint(equalTo: mainWindow.contentView!.trailingAnchor).isActive = true
    rootView.bottomAnchor.constraint(equalTo: mainWindow.contentView!.bottomAnchor).isActive = true
  
    NSEvent.addLocalMonitorForEvents(matching: .keyDown) {
      let metaPressed = $0.modifierFlags.contains(.command)
      SolEmitter.sharedInstance.keyDown(key: $0.characters, keyCode: $0.keyCode, meta: metaPressed)
      
      if handledKeys.contains($0.keyCode) {
        return nil
      }

      if metaPressed && $0.characters != nil && numberchars.contains($0.characters!) {
        return nil
      }      
      
      return $0
    }

    NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) {
      if $0.modifierFlags.contains(.command){
        SolEmitter.sharedInstance.keyDown(key: "command", keyCode: 55, meta: true)
      } else {
        SolEmitter.sharedInstance.keyUp(key: "command", keyCode: 55, meta: false)
      }

      return $0
    }
  }
  
  func toggleWindow() {
    if mainWindow.isVisible && mainWindow.isKeyWindow {
      hideWindow()
    } else {
      showWindow()
    }
  }
  
  func showWindow() {
    if !NSApp.isActive {
      NSApp.activate(ignoringOtherApps: true)
    }
    
    mainWindow.center()
    mainWindow.makeKeyAndOrderFront(self)
    
    SolEmitter.sharedInstance.onShow()
    
    NSCursor.setHiddenUntilMouseMoves(true)
  }
  
  func hideWindow() {
    NSApp.hide(self)
    NSCursor.unhide()
    SolEmitter.sharedInstance.onHide()
  }
}
