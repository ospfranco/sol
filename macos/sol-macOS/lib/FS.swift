import Foundation

@objc public class FS: NSObject {
  @objc static func ls(path: String) throws -> [String] {
    return try FileManager.default.contentsOfDirectory(atPath: path)
  }
}
