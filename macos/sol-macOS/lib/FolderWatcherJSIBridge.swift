import Foundation

@_cdecl("createFolderWatcher")
public func createFolderWatcher(
  pathPtr: UnsafePointer<CChar>,
  callback:
    @convention(c) (UnsafePointer<CChar>, UnsafePointer<CChar>, UnsafeMutableRawPointer?) -> Void,
  context: UnsafeMutableRawPointer?
) -> UnsafeMutableRawPointer? {
  let path = String(cString: pathPtr)
  let watcher = FolderWatcher(path: path) { changedPath, changeType in
    changedPath.withCString { cPath in
      changeType.withCString { cType in
        callback(cPath, cType, context)
      }
    }
  }
  return Unmanaged.passRetained(watcher).toOpaque()
}

@_cdecl("destroyFolderWatcher")
public func destroyFolderWatcher(_ watcherPtr: UnsafeMutableRawPointer?) {
  if let ptr = watcherPtr {
    Unmanaged<FolderWatcher>.fromOpaque(ptr).release()
  }
}
