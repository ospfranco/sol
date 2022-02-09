import Foundation
import Cocoa
import HotKey
import EventKit
import LaunchAtLogin

let handledKeys: [UInt16] = [53, 126, 125, 36, 48]
let numberchars: [String] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate  {
  
  var mainWindow: Panel!
  let hotKey = HotKey(key: .space, modifiers: [.option])
//  let hotKey = HotKey(key: .space, modifiers: [.command])
  let dateFormatter = ISO8601DateFormatter()
  
  func applicationDidFinishLaunching(_ aNotification: Notification) {
    LaunchAtLogin.isEnabled = true
    hotKey.keyDownHandler = toggle
    
    let eventAuthorizationStatus = EKEventStore.authorizationStatus(for: .event)
    if eventAuthorizationStatus == .notDetermined {
      let store = EKEventStore()
      store.requestAccess(to: .event) { granted, error in
          print("Event kit request access response")
      }
    }

    let jsCodeLocation: URL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:"main")

    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "sol", initialProperties: nil, launchOptions: nil)
    let rootViewController = NSViewController()
    rootViewController.view = rootView
    
    mainWindow = Panel(
      contentRect: NSRect(x: 0, y: 0, width: 800, height: 600),
      backing: .buffered, defer: false)
    
    mainWindow.contentViewController = rootViewController
    let origin = CGPoint(x: 0, y: 0)
    let size = CGSize(width: 800, height: 600)
    let frame = NSRect(origin: origin, size: size)
    mainWindow.setFrame(frame, display: false)
    
    // showWindow()
    
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
  }
  
  
  func getNextEvents() -> Any? {
    
    let eventAuthorizationStatus = EKEventStore.authorizationStatus(for: .event)
    if(eventAuthorizationStatus != .authorized) {
      return []
    }
    
    let store = EKEventStore()
    
    let calendars = store.calendars(for: .event)
    
    let now = Date()
    let tomorrow = Date(timeIntervalSinceNow: 3*24*3600)
    let predicate = store.predicateForEvents(withStart: now, end: tomorrow, calendars: calendars)
    let events = store.events(matching: predicate)
    
    return events.map { event -> Any in
      
      let color = event.calendar.color
      let hexColor = String(format: "#%02X%02X%02X", (Int) (color!.redComponent * 0xFF), (Int) (color!.greenComponent * 0xFF),
                            (Int) (color!.blueComponent * 0xFF))
      
      return [
        "title": event.title,
        "url": event.url?.absoluteString,
        "notes": event.notes,
        "location": event.location,
        "color": hexColor,
        "date": event.startDate != nil ? dateFormatter.string(from: event.startDate) : nil,
        "isAllDay": event.isAllDay
      ]
    }
  }
  
  func toggle() {
    if mainWindow.isVisible && mainWindow.isKeyWindow {
      hideWindow()
    } else {
      showWindow()
    }
  }
  
  func showWindow() {
    mainWindow.makeKeyAndOrderFront(self)
    mainWindow.center()
    
    if !NSApp.isActive {
      NSApp.activate(ignoringOtherApps: true)
    }
    NSCursor.setHiddenUntilMouseMoves(true)
    SolEmitter.sharedInstance.onShow()
  }
  
  func hideWindow() {
    NSApp.hide(self)
    NSCursor.unhide()
    SolEmitter.sharedInstance.onHide()
  }
  
  func closeApp() {
    NSApp.terminate(nil)
  }
}
