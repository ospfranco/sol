import HotKey

final class HotKeyManager {
  let handledKeys: [UInt16] = [53, 123, 124, 126, 125, 36, 48]
  let numberchars: [String] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
  public var catchHorizontalArrowsPress = false
  public var catchVerticalArrowsPress = true
  public var catchEnterPress = true
  private var shiftPressed = false
  
  public let settingsHotKey = HotKey(key: .comma, modifiers: [.command])
  public var mainHotKey = HotKey(key: .space, modifiers: [.command])
  private var hotkeys: [HotKey] = []
  
  static public let shared = HotKeyManager()
  
  public func setupKeyboardListeners() {
    settingsHotKey.keyDownHandler = {
      SolEmitter.sharedInstance.onShow(target: "SETTINGS")
    }
    mainHotKey.keyDownHandler = PanelManager.shared.toggle
    NSEvent.addLocalMonitorForEvents(matching: .keyDown) {
      //      36 enter
      //      123 arrow left
      //      124 arrow right
      //      125 arrow down
      //      126 arrow up
      if ($0.keyCode == 123 || $0.keyCode == 124)
          && !self
        .catchHorizontalArrowsPress
      {
        return $0
      }
      
      if ($0.keyCode == 125 || $0.keyCode == 126)
          && !self
        .catchVerticalArrowsPress
      {
        return $0
      }
      
      if $0.keyCode == 36 && !self.catchEnterPress {
        return $0
      }
      
      let metaPressed = $0.modifierFlags.contains(.command)
      let shiftPressed = $0.modifierFlags.contains(.shift)
      SolEmitter.sharedInstance.keyDown(
        key: $0.characters,
        keyCode: $0.keyCode,
        meta: metaPressed,
        shift: shiftPressed
      )
      
      if self.handledKeys.contains($0.keyCode) {
        return nil
      }
      
      if metaPressed && $0.characters != nil
          && self.numberchars
        .contains($0.characters!)
      {
        return nil
      }
      
      return $0
    }
    
    NSEvent.addLocalMonitorForEvents(matching: .flagsChanged) {
      if $0.modifierFlags.contains(.command) {
        SolEmitter.sharedInstance.keyDown(
          key: "command",
          keyCode: 55,
          meta: true,
          shift: self.shiftPressed
        )
      } else {
        SolEmitter.sharedInstance.keyUp(
          key: "command",
          keyCode: 55,
          meta: false,
          shift: self.shiftPressed
        )
      }
      
      if $0.modifierFlags.contains(.shift) {
        self.shiftPressed = true
        SolEmitter.sharedInstance.keyDown(
          key: "shift",
          keyCode: 60,
          meta: false,
          shift: self.shiftPressed
        )
      } else {
        self.shiftPressed = false
        SolEmitter.sharedInstance.keyUp(
          key: "shift",
          keyCode: 60,
          meta: false,
          shift: self.shiftPressed
        )
      }
      
      return $0
    }
  }
  
  func updateHotkeys(hotkeyMap: [String: String]) {
    hotkeys.forEach { $0.isPaused = true }
    hotkeys.removeAll()
    
    for (key, value) in hotkeyMap {
      let components = value.split(separator: "+").map { String($0) }
      var modifiers: NSEvent.ModifierFlags = []
      var keyValue: Key?
      
      for component in components {
        switch component
          .lowercased()
          .trimmingCharacters(in: .whitespacesAndNewlines) {
        case "cmd":
          modifiers.insert(.command)
        case "command":
          modifiers.insert(.command)
        case "control":
          modifiers.insert(.control)
        case "option":
          modifiers.insert(.option)
        case "shift":
          modifiers.insert(.shift)
        case "space":
          keyValue = .space
        case "up":
          keyValue = .upArrow
        case "down":
          keyValue = .downArrow
        case "left":
          keyValue = .leftArrow
        case "right":
          keyValue = .rightArrow
        case "return":
          keyValue = .return
        default:
          keyValue = Key(string: component)
        }
      }
      
      guard let finalKey = keyValue else { continue }
      let hotKey = HotKey(key: finalKey, modifiers: modifiers)
      
      hotKey.keyDownHandler = {
        SolEmitter.sharedInstance.onHotkey(id: key)
      }
      hotkeys.append(hotKey)
    }
    
  }
}