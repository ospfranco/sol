import Foundation
import CoreServices

class FileSearchIndexer {
  static let shared = FileSearchIndexer()

  private var eventStream: FSEventStreamRef?
  private var watchedPaths: [String] = []
  private let processingQueue = DispatchQueue(label: "com.ospfranco.sol.filesearch.events", qos: .utility)

  func startWatching(paths: [String]) {
    stopWatching()
    guard !paths.isEmpty else { return }
    watchedPaths = paths

    let pathsCF = paths as CFArray
    var context = FSEventStreamContext(
      version: 0,
      info: Unmanaged.passUnretained(self).toOpaque(),
      retain: nil,
      release: nil,
      copyDescription: nil
    )

    guard let stream = FSEventStreamCreate(
      kCFAllocatorDefault,
      { _, info, numEvents, eventPaths, eventFlags, _ in
        guard let info = info else { return }
        let indexer = Unmanaged<FileSearchIndexer>.fromOpaque(info).takeUnretainedValue()
        let cfPaths = Unmanaged<CFArray>.fromOpaque(eventPaths).takeUnretainedValue() as NSArray
        guard let paths = cfPaths as? [String] else { return }
        let flags = Array(UnsafeBufferPointer(start: eventFlags, count: numEvents))
        indexer.handleEvents(paths: paths, flags: flags)
      },
      &context,
      pathsCF,
      FSEventStreamEventId(kFSEventStreamEventIdSinceNow),
      0.5, // 500ms latency
      FSEventStreamCreateFlags(kFSEventStreamCreateFlagFileEvents | kFSEventStreamCreateFlagNoDefer | kFSEventStreamCreateFlagUseCFTypes)
    ) else { return }

    eventStream = stream
    FSEventStreamSetDispatchQueue(stream, processingQueue)
    FSEventStreamStart(stream)
  }

  func stopWatching() {
    guard let stream = eventStream else { return }
    FSEventStreamStop(stream)
    FSEventStreamInvalidate(stream)
    FSEventStreamRelease(stream)
    eventStream = nil
  }

  private func handleEvents(paths: [String], flags: [FSEventStreamEventFlags]) {
    let index = FileSearchIndex.shared
    let fileManager = FileManager.default

    for (path, flag) in zip(paths, flags) {
      let isRemoved = flag & FSEventStreamEventFlags(kFSEventStreamEventFlagItemRemoved) != 0
      let isRenamed = flag & FSEventStreamEventFlags(kFSEventStreamEventFlagItemRenamed) != 0

      if isRemoved || (isRenamed && !fileManager.fileExists(atPath: path)) {
        index.removeFile(atPath: path)
      } else if fileManager.fileExists(atPath: path) {
        var isDir: ObjCBool = false
        fileManager.fileExists(atPath: path, isDirectory: &isDir)
        let name = (path as NSString).lastPathComponent
        let parent = (path as NSString).deletingLastPathComponent
        index.upsertFile(path: path, name: name, isFolder: isDir.boolValue, parentPath: parent)
      }
    }
  }
}
