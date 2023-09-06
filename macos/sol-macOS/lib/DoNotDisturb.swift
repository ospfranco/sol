import Foundation
import Cocoa

func getElement(target: AXUIElement, name: String) -> AXUIElement?{

  var attributes: CFArray? = nil

  AXUIElementCopyAttributeNames(target, &attributes);

  guard let attributes = attributes else {
    return nil
  }

  for attribute in attributes as NSArray {
    print(attribute as! CFString)
  }

  assert((attributes as NSArray).contains(name))


  var element: CFTypeRef?
  AXUIElementCopyAttributeValue(target, name as CFString, &element)

  guard let element = element else {
    return nil
  }

  return element as! AXUIElement?
}

func getChild(parent: AXUIElement, withTitle: String) -> AXUIElement? {

  var children: CFTypeRef?
  AXUIElementCopyAttributeValue(parent, "AXChildren" as CFString, &children)

  guard let children = children else {
    return nil
  }

  guard let items = children as? NSArray else {
    return nil
  }
  for x in items {
    let child = x as! AXUIElement

    var title: CFTypeRef?
    AXUIElementCopyAttributeValue(child, "AXTitle" as CFString, &title)

    guard let title = title else {
      continue
    }

    assert(CFGetTypeID(title) == CFStringGetTypeID())

    if ((title as! CFString) as String) == withTitle {

      return child
    }
  }

  return nil
}


public struct DoNotDisturb {
  static func toggle() {

    let apps = NSWorkspace.shared.runningApplications

    guard let controlCenter = apps.first(where: {$0.bundleIdentifier == "com.apple.controlcenter"}) else {
      print("Control Center App not found!")
      return
    }

    let target = AXUIElementCreateApplication(controlCenter.processIdentifier)

    guard let menubar = getElement(target: target, name: "AXExtrasMenuBar") else {
      print("AXExtrasMenuBar not found!")
      return
    }

    guard let controlCenterMenu = getChild(parent: menubar, withTitle: "Control Center") else {
      print("\nControl Center not found!!")
      return
    }

    // Press the menu
    AXUIElementPerformAction(controlCenterMenu, kAXPressAction as CFString)

    // Now get the apps main window children since it will be showing
    guard let dialog = getElement(target: target, name: "AXFocusedWindow") else {
      print("AXFocusedWindow not found!")
      return
    }


    // Tries to find "focus" which means it is not enabled, then enables DND
    if let focusMenu = getChild(parent: dialog, withTitle: "Focus") {

      // Press the menu
      AXUIElementPerformAction(focusMenu, kAXPressAction as CFString)

    } else {
      // Tries to find do not disturb, then turns it off
      if let doNotDisturbMenu = getChild(parent: dialog, withTitle: "Do Not Disturb") {

        // Press the menu
        AXUIElementPerformAction(doNotDisturbMenu, kAXPressAction as CFString)

      } else {
        print("\nDo Not Disturb NOT found !!")
      }
    }

    // Press the menu
    AXUIElementPerformAction(controlCenterMenu, kAXPressAction as CFString)
  }
}
