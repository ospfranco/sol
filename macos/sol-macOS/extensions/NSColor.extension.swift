import Foundation
import Cocoa

extension NSColor {
  
  convenience init?(hex: NSString) {
      var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
      hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

      var rgb: UInt32 = 0

      var r: CGFloat = 0.0
      var g: CGFloat = 0.0
      var b: CGFloat = 0.0
      var a: CGFloat = 1.0

      let length = hexSanitized.count

      guard Scanner(string: hexSanitized).scanHexInt32(&rgb) else { return nil }

      if length == 6 {
          r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
          g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
          b = CGFloat(rgb & 0x0000FF) / 255.0

      } else if length == 8 {
          r = CGFloat((rgb & 0xFF000000) >> 24) / 255.0
          g = CGFloat((rgb & 0x00FF0000) >> 16) / 255.0
          b = CGFloat((rgb & 0x0000FF00) >> 8) / 255.0
          a = CGFloat(rgb & 0x000000FF) / 255.0

      } else {
          return nil
      }

      self.init(red: r, green: g, blue: b, alpha: a)
  }

  
  var hexString: String {
    let srgbColor = self.usingColorSpace(.sRGB)!
    let red = Int(round(srgbColor.redComponent * 0xFF))
    let green = Int(round(srgbColor.greenComponent * 0xFF))
    let blue = Int(round(srgbColor.blueComponent * 0xFF))
    let hexString = NSString(format: "#%02X%02X%02X", red, green, blue)
    return hexString as String
  }
}
