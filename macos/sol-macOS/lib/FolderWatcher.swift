import Foundation

class FolderWatcher {
  private var streamRef: FSEventStreamRef?
  private var watchedPath: String?
  private let onChange: (String, String) -> Void

  init(path: String, onChange: @escaping (String, String) -> Void) {
    self.watchedPath = path
    self.onChange = onChange
    startWatching(path: path)
  }

  private func startWatching(path: String) {
    stopWatching()
    let callback: FSEventStreamCallback = {
      (
        streamRef: ConstFSEventStreamRef,
        clientCallBackInfo: UnsafeMutableRawPointer?,
        numEvents: Int,
        eventPaths: UnsafeMutableRawPointer,
        eventFlags: UnsafePointer<FSEventStreamEventFlags>,
        eventIds: UnsafePointer<FSEventStreamEventId>
      ) in
      let folderWatcher = Unmanaged<FolderWatcher>.fromOpaque(clientCallBackInfo!)
        .takeUnretainedValue()
      let paths = Unmanaged<CFArray>.fromOpaque(eventPaths).takeUnretainedValue() as! [String]
      for i in 0..<numEvents {
        let path = paths[i]
        let flag = eventFlags[i]
        var changeType = "modified"
        if (flag & UInt32(kFSEventStreamEventFlagItemCreated)) != 0 {
          changeType = "created"
        } else if (flag & UInt32(kFSEventStreamEventFlagItemRemoved)) != 0 {
          changeType = "deleted"
        }
        folderWatcher.onChange(path, changeType)
      }
    }
    var context = FSEventStreamContext(
      version: 0,
      info: UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque()),
      retain: nil,
      release: nil,
      copyDescription: nil
    )
    streamRef = FSEventStreamCreate(
      kCFAllocatorDefault,
      callback,
      &context,
      [path] as CFArray,
      FSEventStreamEventId(kFSEventStreamEventIdSinceNow),
      0.5,
      UInt32(kFSEventStreamCreateFlagFileEvents | kFSEventStreamCreateFlagNoDefer)
    )
    if let streamRef = streamRef {
      FSEventStreamScheduleWithRunLoop(
        streamRef, CFRunLoopGetMain(), CFRunLoopMode.defaultMode.rawValue)
      FSEventStreamStart(streamRef)
    }
  }

  func stopWatching() {
    if let streamRef = streamRef {
      FSEventStreamStop(streamRef)
      FSEventStreamInvalidate(streamRef)
      FSEventStreamRelease(streamRef)
      self.streamRef = nil
    }
  }

  deinit {
    stopWatching()
  }
}
