import Foundation
import Cocoa

extension NSColor {
  var hexString: String {
    let srgbColor = self.usingColorSpace(.sRGB)!
    let red = Int(round(srgbColor.redComponent * 0xFF))
    let green = Int(round(srgbColor.greenComponent * 0xFF))
    let blue = Int(round(srgbColor.blueComponent * 0xFF))
    let hexString = NSString(format: "#%02X%02X%02X", red, green, blue)
    return hexString as String
  }
}
