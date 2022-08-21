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
  func keyDown(key: String?, keyCode: UInt16, meta: Bool, shift: Bool) {
    dispatch(name: "keyDown", body: [
      "key": key!,
      "keyCode": keyCode,
      "meta": meta,
      "shift": shift
    ])
  }

  func keyUp(key: String?, keyCode: UInt16, meta: Bool, shift: Bool) {
    dispatch(name: "keyUp", body: [
      "key": key!,
      "keyCode": keyCode,
      "meta": meta,
      "shift": shift
    ])
  }

  func onShow(target: String?) {
    dispatch(name: "onShow", body: [
      "target": target
    ])
  }

  func onHide() {
    dispatch(name: "onHide", body: [])
  }

  func textPasted(_ txt: String) {
    dispatch(name: "onTextPasted", body: [
      "text": txt
    ])
  }

//  func fileSearchResult(_ results: )
}
