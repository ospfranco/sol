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
  
  func onHotkey(id: String) {
    print("dispatching hotkey for \(id)")
    dispatch(name: "hotkey", body: [
      "id": id
    ])
  }

  func onHide() {
    dispatch(name: "onHide", body: [])
  }

  func textCopied(_ txt: String,_ bundle: String?) {
    dispatch(name: "onTextCopied", body: [
      "text": txt,
      "bundle": bundle
    ])
  }
  
  func onStatusBarItemClick() {
    dispatch(name: "onStatusBarItemClick", body: [])
  }
}
