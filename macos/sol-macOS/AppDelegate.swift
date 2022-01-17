import Foundation
import Cocoa
import HotKey

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate  {
  var myWindowDelegate: MyNSWindowDelegate!
  var mainWindow: NSWindow!
  var statusBarItem: NSStatusItem!
  let hotKey = HotKey(key: .space, modifiers: [.option])
  
  func applicationDidFinishLaunching(_ aNotification: Notification) {
    self.myWindowDelegate = MyNSWindowDelegate(resignHandler: {
      print("ROPO trying to hide window")
      self.hideWindow()
    })
    
    
    
    let jsCodeLocation: URL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:"main")

    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "sol", initialProperties: nil, launchOptions: nil)
    let rootViewController = NSViewController()
    rootViewController.view = rootView
    
    mainWindow = createWindow()
    mainWindow.delegate = myWindowDelegate
    mainWindow.setFrameAutosaveName("Main Window")
    mainWindow.contentViewController = rootViewController
    let origin = CGPoint(x: 0, y: 0)
    let size = CGSize(width: 800, height: 600)
    let frame = NSRect(origin: origin, size: size)
    mainWindow.setFrame(frame, display: true)
    
    showWindow()
    hotKey.keyDownHandler = {
      self.showWindow()
    }

  }
  
  private func createWindow() -> NSWindow {
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 800, height: 500),
//      styleMask: [.borderless, .closable, .miniaturizable],
      styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView, .borderless],
      backing: .buffered, defer: false)
    
    window.titlebarAppearsTransparent = true
    window.titleVisibility = .hidden
    window.isMovableByWindowBackground = false
    window.isReleasedWhenClosed = false
    window.collectionBehavior = [.transient, .ignoresCycle]
    window.standardWindowButton(.closeButton)?.isHidden = true
    window.standardWindowButton(.zoomButton)?.isHidden = true
    window.standardWindowButton(.miniaturizeButton)?.isHidden = true
    window.isOpaque = false
    window.backgroundColor = .clear
    return window
  }
  

  func toggleWindow(_ sender: AnyObject?) {
    if self.mainWindow.isVisible || self.mainWindow.isKeyWindow {
      self.mainWindow.close()
    } else {
      self.mainWindow.makeKeyAndOrderFront(self)
      self.mainWindow.center()
       if !NSApp.isActive {
         NSApp.activate(ignoringOtherApps: true)
       }
    }
  }
  
  func showWindow() {
    self.mainWindow.makeKeyAndOrderFront(self)
    self.mainWindow.center()
    if !NSApp.isActive {
      NSApp.activate(ignoringOtherApps: true)
    }
  }
  
  func hideWindow() {
  
    self.mainWindow.close()
  }
  
  func closeApp() {
    NSApp.terminate(nil)
  }
}
