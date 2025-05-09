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
  
  static func copyFileFromUrl(_ url: URL, toPath path: String) throws {
    if exists(path: path) {
      try FileManager.default.removeItem(at: URL(fileURLWithPath: path))
    }
    try FileManager.default.copyItem(at: url, to: URL(fileURLWithPath: path))
  }
  
  static func delete(_ path: String) throws {
    try FileManager.default.removeItem(at: URL(fileURLWithPath: path))
  }
}
