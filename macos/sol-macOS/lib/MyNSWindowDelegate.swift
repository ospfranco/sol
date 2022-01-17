//
//  MyNSWindowDelegate.swift
//  Messer
//
//  Created by Oscar on 07.12.21.
//

import Foundation
import AppKit

class MyNSWindowDelegate: NSObject, NSWindowDelegate {
  var resignHandler: () -> Void
   
  init(resignHandler: @escaping () -> Void) {
    self.resignHandler = resignHandler
  }
  
  func windowDidResignKey(_ notification: Notification) {
    resignHandler()
  }
  
  func windowDidResignMain(_ notification: Notification) {
    resignHandler()
  }
}
