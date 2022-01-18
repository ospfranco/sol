import Foundation

@objc(SolNative)
class SolNative: RCTEventEmitter {
  override init() {
    super.init()
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  func sendKeyDown(characters: String) {
    self.sendEvent(withName: "keyDown", body: [
      "key": characters
    ])
  }

  @objc
  override func supportedEvents() -> [String]? {
    return [
      "keyDown"
    ]
  }
}
