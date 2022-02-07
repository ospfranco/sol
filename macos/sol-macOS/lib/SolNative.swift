import Foundation

@objc(SolNative)
class SolNative: RCTEventEmitter {
  override init() {
    super.init()
    SolEmitter.sharedInstance.registerEmitter(emitter: self)
  }
  
  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  func sendKeyDown(characters: String) {
    self.sendEvent(withName: "keyDown", body: [
      "key": characters
    ])
  }

  @objc override func supportedEvents() -> [String]? {
    return [
      "keyDown",
      "onShow",
      "onHide"
    ]
  }
  
  @objc func getNextEvents(_ resolve: @escaping  RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      resolve(appDelegate?.getNextEvents())
    }
  }
  
  @objc func hideWindow() {
    DispatchQueue.main.async {
      let appDelegate = NSApp.delegate as? AppDelegate
      appDelegate?.hideWindow()
    }
  }
  
  @objc func getApps(_ resolve: @escaping  RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
    let searcher = ApplicationSearcher()
    let apps = searcher.getAllApplications()
    let res = apps.map { app in
      app.url
    }

    resolve(res)
  }

  @objc func openFile(_ path: String) {
    NSWorkspace.shared.openFile(path)
  }
}
