import Foundation
import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate  {
  var mainWindow: NSWindow!
  var statusBarItem: NSStatusItem!
  
  func applicationDidFinishLaunching(_ aNotification: Notification) {    setupMainView()
    
    let jsCodeLocation: URL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource:"main")

    let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "sol", initialProperties: nil, launchOptions: nil)
    let rootViewController = NSViewController()
    rootViewController.view = rootView
    
    mainWindow.contentViewController = rootViewController
    let origin = CGPoint(x: 0, y: 0)
    let size = CGSize(width: 800, height: 500)
    let frame = NSRect(origin: origin, size: size)
    mainWindow.setFrame(frame, display: true)
    showWindow(nil)
  }
  
  
  func setupMainView() {

    mainWindow = createWindow()
    mainWindow.setFrameAutosaveName("Main Window")
    var registeredDraggedTypes: [NSPasteboard.PasteboardType] = [.fileURL]
    
    let filePromiseReceiverTypes = NSFilePromiseReceiver.readableDraggedTypes.map {
      NSPasteboard.PasteboardType($0)
    }
    
    registeredDraggedTypes.append(contentsOf: filePromiseReceiverTypes)
    
  }
  
  private func createWindow() -> NSWindow {
    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 800, height: 500),
      styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
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
    window.alphaValue = 0.98

     let visualEffect = NSVisualEffectView()
     visualEffect.blendingMode = .behindWindow
     visualEffect.state = .active
    visualEffect.material = .windowBackground
     window.contentView = visualEffect

    return window
  }
  

  @objc func toggleWindow(_ sender: AnyObject?) {
    if self.mainWindow.isVisible && self.mainWindow.isKeyWindow {
      self.mainWindow.close()
//      self.hotKey.isPaused = true
    } else {
//      self.hotKey.isPaused = false
      self.mainWindow.makeKeyAndOrderFront(self)
      self.mainWindow.center()
       if !NSApp.isActive {
         NSApp.activate(ignoringOtherApps: true)
       }
    }
  }
  
  @objc func showWindow(_ sender: AnyObject?) {
    if !(self.mainWindow.isVisible && self.mainWindow.isKeyWindow) {
//      self.hotKey.isPaused = false
      self.mainWindow.makeKeyAndOrderFront(self)
      self.mainWindow.center()
      if !NSApp.isActive {
        NSApp.activate(ignoringOtherApps: true)
      }
    }
  }
  
  @objc func hideWindow() {
    if self.mainWindow.isVisible {
      self.mainWindow.close()
//      self.hotKey.isPaused = true
    }
  }
  
  // func initPipeline(urls: [URL]) {
//    store.initPipeline(urls: urls)
  // }
  
  func closeApp() {
    NSApp.terminate(nil)
  }
}
