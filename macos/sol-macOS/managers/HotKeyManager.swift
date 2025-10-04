import Foundation
import Carbon
import Cocoa
import HotKey


final class HotKeyManager {
  let handledKeys: [UInt16] = [53, 123, 124, 126, 125, 36, 48]
  let numberchars: [String] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
  public var catchHorizontalArrowsPress = false
  public var catchVerticalArrowsPress = true
  public var catchEnterPress = true
  private var shiftPressed = false
  private var controlPressed = false
  private var f18Down = false

  public let settingsHotKey = HotKey(key: .comma, modifiers: [.command])
  public var mainHotKey = HotKey(key: .space, modifiers: [.command])

  private var hotkeys: [HotKey] = []
  private var eventTap: CFMachPort?
  private var runLoopSource: CFRunLoopSource?

  static public let shared = HotKeyManager()

  private init() {
    settingsHotKey.keyUpHandler = {
      SolEmitter.sharedInstance.onShow(target: "SETTINGS")
    }
    mainHotKey.keyUpHandler = PanelManager.shared.toggle

    NSEvent.addLocalMonitorForEvents(matching: .keyDown) {
      // 36 enter
      // 123 arrow left
      // 124 arrow right
      // 125 arrow down
      // 126 arrow up
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
      let controlPressed = $0.modifierFlags.contains(.control)

      SolEmitter.sharedInstance.keyDown(
        key: $0.characters,
        keyCode: $0.keyCode,
        meta: metaPressed,
        shift: shiftPressed,
        control: controlPressed
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
          shift: self.shiftPressed,
          control: self.controlPressed
        )
      } else {
        SolEmitter.sharedInstance.keyUp(
          key: "command",
          keyCode: 55,
          meta: false,
          shift: self.shiftPressed,
          control: self.controlPressed
        )
      }

      if $0.modifierFlags.contains(.shift) {
        self.shiftPressed = true
        SolEmitter.sharedInstance.keyDown(
          key: "shift",
          keyCode: 60,
          meta: false,
          shift: self.shiftPressed,
          control: self.controlPressed
        )
      } else {
        self.shiftPressed = false
        SolEmitter.sharedInstance.keyUp(
          key: "shift",
          keyCode: 60,
          meta: false,
          shift: self.shiftPressed,
          control: self.controlPressed
        )
      }

      if $0.modifierFlags.contains(.control) {
        self.controlPressed = true
        SolEmitter.sharedInstance
          .keyDown(
            key: "control",
            keyCode: 59,
            meta: false,
            shift: self.shiftPressed,
            control: self.controlPressed
          )
      } else {
        self.controlPressed = false
        SolEmitter.sharedInstance
          .keyUp(
            key: "control",
            keyCode: 59,
            meta: false,
            shift: self.shiftPressed,
            control: self.controlPressed
          )
      }

      return $0
    }
  }
  
  deinit {
    resetCapsLockMapping()
    if let eventTap = eventTap {
      CFMachPortInvalidate(eventTap)
    }
    
    if let src = runLoopSource {
      CFRunLoopRemoveSource(CFRunLoopGetCurrent(), src, .commonModes)
    }
  }

  func updateHotkeys(hotkeyMap: [String: String]) {
    hotkeys.removeAll()

    for (key, value) in hotkeyMap {
      let components = value.split(separator: "+").map { String($0) }
      var modifiers: NSEvent.ModifierFlags = []
      var keyValue: Key?

      for component in components {
        switch component
          .lowercased()
          .trimmingCharacters(in: .whitespacesAndNewlines)
        {
        case "⌘":
          modifiers.insert(.command)
        case "cmd":
          modifiers.insert(.command)
        case "command":
          modifiers.insert(.command)
        case "⌃":
          modifiers.insert(.control)
        case "control":
          modifiers.insert(.control)
        case "⌥":
          modifiers.insert(.option)
        case "option":
          modifiers.insert(.option)
        case "⇧":
          modifiers.insert(.shift)
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

      hotKey.keyUpHandler = {
        SolEmitter.sharedInstance.onHotkey(id: key)
      }
      hotkeys.append(hotKey)
    }
  }

  private func resetCapsLockMapping() {
    executeHidutil(payload: ["UserKeyMapping": []])
  }

  private func setCapsLockMapping() {
    let mapping: [[String: Any]] = [
      [
        "HIDKeyboardModifierMappingSrc": 0x7_0000_0039,
        "HIDKeyboardModifierMappingDst": 0x7_0000_006D,
      ],
    ]
    executeHidutil(payload: ["UserKeyMapping": mapping])
  }
  
  private func executeHidutil(payload: [String: Any]) {
    guard
      let data = try? JSONSerialization.data(
        withJSONObject: payload,
        options: []
      ),
      let json = String(data: data, encoding: .utf8)
    else { return }
    let proc = Process()
    proc.executableURL = URL(fileURLWithPath: "/usr/bin/hidutil")
    proc.arguments = ["property", "--set", json]
    do {
      try proc.run()
      proc.waitUntilExit()
    } catch { NSLog("hidutil failed: \(error)") }
  }

  
  func resetCapsLockMonitoring() {
    resetCapsLockMapping()
    if let eventTap = eventTap {
      CGEvent.tapEnable(tap: eventTap, enable: false)
      CFMachPortInvalidate(eventTap)
    }
  }

  func setupCapsLockMonitoring() {
    let mask =
    (1 << CGEventType.keyDown.rawValue)
    | (1 << CGEventType.keyUp.rawValue)
    | (1 << CGEventType.flagsChanged.rawValue)
    
    guard let tap = CGEvent.tapCreate(
      tap: .cgSessionEventTap,
      place: .headInsertEventTap,
      options: .defaultTap,
      eventsOfInterest: CGEventMask(mask),
      callback: { (proxy, type, event, refcon) -> Unmanaged<CGEvent>? in
        let manager = Unmanaged<HotKeyManager>.fromOpaque(refcon!).takeUnretainedValue()
        return manager.handleCapsLockEvent(proxy: proxy, type: type, event: event)
      },
      userInfo: Unmanaged.passUnretained(self).toOpaque()
    ) else {
      print("Failed to create event tap for caps lock monitoring")
      return
    }
    
    
    print("Created event tap correctly! 🟩")
    eventTap = tap

    runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
    CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
    CGEvent.tapEnable(tap: tap, enable: true)
    setCapsLockMapping()
  }

  private func handleCapsLockEvent(
    proxy: CGEventTapProxy, type: CGEventType, event: CGEvent
  )
    -> Unmanaged<CGEvent>?
  {
    if type == .keyDown || type == .keyUp {
      let code = UInt8(event.getIntegerValueField(.keyboardEventKeycode))
      if code == UInt8(kVK_F18) {
        if type == .keyDown {
          print("F18 Key down")
          f18Down = true
//          lastKeyDown = Date()
//          quickPressHandled = false
        } else {
          print("F18 key up")
          f18Down = false
//          handleQuickPress()
        }
        return nil
      }
    }
    
    // Long press is ALWAYS hyperkey - apply hyperkey modifiers when F18 is held
    if f18Down {
      return handleHyperKeyModifiers(type: type, event: event)
    }
    
    return Unmanaged.passUnretained(event)
  }
  
  
  private func handleHyperKeyModifiers(type _: CGEventType, event: CGEvent) -> Unmanaged<CGEvent>? {
    // Only modify non-F18 key events
    let code = UInt8(event.getIntegerValueField(.keyboardEventKeycode))
    if code != UInt8(kVK_F18) {
      // Get the current flags from the event
      let currentFlags = event.flags
      
      // Create base hyper key modifiers (Command + Control + Option)
      var hyperFlags: CGEventFlags = [.maskCommand, .maskControl, .maskAlternate]
      
      // Add shift by default if includeShift flag is set
//      if includeShift {
        hyperFlags.insert(.maskShift)
//      }
      
      // Preserve any manually added modifiers that are already present in the event
//      if !includeShift && currentFlags.contains(.maskShift) {
//        hyperFlags.insert(.maskShift)
//      }
      
      // Preserve any other potential modifiers
      if currentFlags.contains(.maskSecondaryFn) {
        hyperFlags.insert(.maskSecondaryFn)
      }
      
      // Apply the combined flags to the event
      event.flags = hyperFlags
      
      // Mark as handled since we used it as a modifier
//      quickPressHandled = true
    }
    
    return Unmanaged.passUnretained(event)
  }


}
