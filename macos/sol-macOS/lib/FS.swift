import Foundation

@objc public class FS: NSObject {
  @objc static func ls(path: String) throws -> [String] {
    return try FileManager.default.contentsOfDirectory(atPath: path)
  }

  @objc static func exists(path: String) -> Bool {
    return FileManager.default.fileExists(atPath: path)
  }

  @objc static func readFile(path: String) -> String? {
    if FileManager.default.fileExists(atPath: path) {
      guard let data = FileManager.default.contents(atPath: path) else {
        return nil
      }
      
      let str = String(decoding: data, as: UTF8.self)
      return str
    } else {
      return nil
    }
  }
}
