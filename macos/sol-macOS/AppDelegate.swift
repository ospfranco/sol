import Foundation
import Cocoa
import HotKey

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate  {
  var myWindowDelegate: MyNSWindowDelegate!
  var mainWindow: NSWindow!
  var statusBarItem: NSStatusItem!
  let hotKey = HotKey(key: .space, modifiers: [.option])
//  let tabHotkey = HotKey(key: .a, modifiers: [])
  
  func applicationDidFinishLaunching(_ aNotification: Notification) {
    self.myWindowDelegate = MyNSWindowDelegate(resignHandler: {
      #if !DEBUG
      self.hideWindow()
      #endif
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
    mainWindow.setFrame(frame, display: false)
    
    showWindow()

    hotKey.keyDownHandler = {
      self.showWindow()
    }
    
    NSEvent.addLocalMonitorForEvents(matching: .keyDown) {
      self.keyDown(with: $0)
      return $0
    }
    
  }
  
  func keyDown(with event: NSEvent) {
    print("MARKER pressed \(event.characters ?? "NO_CHAR")")
  }
  
  private func createWindow() -> NSWindow {
    let window = NSPanel(
      contentRect: NSRect(x: 0, y: 0, width: 800, height: 500),
      styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
      backing: .buffered, defer: false)
    
    window.collectionBehavior = [.moveToActiveSpace, .transient, .ignoresCycle]
    window.titlebarAppearsTransparent = true
    window.titleVisibility = .hidden
//    window.isMovableByWindowBackground = false
    window.isReleasedWhenClosed = false
    
    window.standardWindowButton(.closeButton)?.isHidden = true
    window.standardWindowButton(.zoomButton)?.isHidden = true
    window.standardWindowButton(.miniaturizeButton)?.isHidden = true
    window.isOpaque = false
    window.backgroundColor = .clear
    return window
  }
  

  func toggleWindow(_ sender: AnyObject?) {
    if self.mainWindow.isVisible && self.mainWindow.isKeyWindow {
      hideWindow()
    } else {
      showWindow()
    }
  }
  
  func showWindow() {
    NSApp.activate(ignoringOtherApps: true)
    mainWindow.center()
    mainWindow.makeKeyAndOrderFront(self)
  }
  
  func hideWindow() {
    self.mainWindow.close()
  }
  
  func closeApp() {
    NSApp.terminate(nil)
  }
}
