import Foundation

struct FileConstants {

  static let appHomeURL: URL = {
    let applicationSupportURL = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
    let bundleIdentifier = Bundle.main.bundleIdentifier
    let appHomeURL = applicationSupportURL!.appendingPathComponent(bundleIdentifier!)
    try? FileManager.default.createDirectory(at: appHomeURL, withIntermediateDirectories: true, attributes: nil)
    return appHomeURL
  }()

  static let homeURL: URL = {
    let destinationURL = URL(fileURLWithPath: NSHomeDirectory())
    return destinationURL
  }()

  static let tempURL: URL = {
    let destinationURL = URL(fileURLWithPath: NSTemporaryDirectory())
    return destinationURL
  }()

  /// Queue used for reading and writing file promises.
  static let workQueue: OperationQueue = {
    let providerQueue = OperationQueue()
    providerQueue.qualityOfService = .userInitiated
    return providerQueue
  }()
}
