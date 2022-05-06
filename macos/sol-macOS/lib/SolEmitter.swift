import Foundation

class SolEmitter {

  var hasListeners = false

  public static var sharedInstance = SolEmitter()

  private static var emitter: SolNative!

  func registerEmitter(emitter: SolNative) {
    SolEmitter.emitter = emitter
  }

  func dispatch(name: String, body: Any?) {
    if hasListeners {
      SolEmitter.emitter.sendEvent(withName: name, body: body)
    }
  }

  // You can add more typesafety here if you want to
  func keyDown(key: String?, keyCode: UInt16, meta: Bool) {
    dispatch(name: "keyDown", body: [
      "key": key!,
      "keyCode": keyCode,
      "meta": meta
    ])
  }

  func keyUp(key: String?, keyCode: UInt16, meta: Bool) {
    dispatch(name: "keyUp", body: [
      "key": key!,
      "keyCode": keyCode,
      "meta": meta
    ])
  }

  func onShow() {
    dispatch(name: "onShow", body: [])
  }

  func onHide() {
    dispatch(name: "onHide", body: [])
  }

  func showScratchPad() {
    dispatch(name: "showScratchpad", body: [])
  }
}
