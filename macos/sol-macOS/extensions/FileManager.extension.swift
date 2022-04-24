import Foundation

extension FileManager {
  func secureCopyItem(at srcURL: URL, to dstURL: URL) {
    do {
      if FileManager.default.fileExists(atPath: dstURL.path) {
        try FileManager.default.removeItem(at: dstURL)
      }

      try FileManager.default.copyItem(at: srcURL, to: dstURL)
    } catch let error {
      print("SOL, could not copy file \(error)")
    }
  }

  func secureDeleteItem(at srcURL: URL) {
    do {
      if FileManager.default.fileExists(atPath: srcURL.path) {
        try FileManager.default.removeItem(at: srcURL)
      }
    } catch let error {
      print("SOL, could not delete file \(error)")
    }
  }
}
