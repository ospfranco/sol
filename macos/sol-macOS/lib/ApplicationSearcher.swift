import Cocoa
import CoreServices
import Sentry

class Application {
  public var name: String
  public var localizedName: String
  public var url: String
  public var isRunning: Bool

  init(name: String, localizedName: String, url: String, isRunning: Bool) {
    self.name = name
    self.localizedName = localizedName
    self.url = url
    self.isRunning = isRunning
  }

  func toDictionary() -> [String: Any] {
    return [
      "name": name,
      "localizedName": localizedName,
      "url": url,
      "isRunning": isRunning,
    ]
  }
}

@objc public class ApplicationSearcher: NSObject {
  let searchDepth = 4
  let fileManager = FileManager()

  let isAliasResourceKey: [URLResourceKey] = [
    .isAliasFileKey
  ]

  let resourceKeys: [URLResourceKey] = [
    .isExecutableKey,
    .isApplicationKey,
    .isSymbolicLinkKey,
  ]

  @objc public static let shared = ApplicationSearcher()

  // File watching
  private var eventStream: FSEventStreamRef?
  private var isWatchingFolders = false
  public var onApplicationsChanged: (() -> Void)?

  var fixedUrls: [URL] = [
    URL(fileURLWithPath: "/System/Library/CoreServices/Finder.app")
  ]

  let ignoredPatterns: Set<String> = [
    "Audio MIDI Setup.app",
    "Script Editor.app",
    "Grapher.app",
    "Airport Utility.app",
    "ColorSync Utility.app",
    "Bluetooth File Exchange.app",
    "Tips",
    "Siri.app",
    ".DS_Store",
    ".localized",
    "Icon",
    "en_US.strings",
    "Tips.app",
  ]

  private var watchedDirectories: [String] = []
  private var wakeObserver: NSObjectProtocol?

  override init() {
    super.init()

    // Observe system wake notification to restart FSEventStream
    wakeObserver = NSWorkspace.shared.notificationCenter.addObserver(
      forName: NSWorkspace.didWakeNotification,
      object: nil,
      queue: OperationQueue.main
    ) { [weak self] _ in
      self?.handleWakeFromSleep()
    }

    startWatchingFolders()

    if #unavailable(macOS 14) {
      fixedUrls.append(
        URL(
          fileURLWithPath:
            "/System/Library/CoreServices/Applications/Screen Sharing.app"
        )
      )
    }

    if #available(macOS 15, *) {
      fixedUrls.append(
        URL(
          fileURLWithPath:
            "/System/Library/CoreServices/Applications/Keychain Access.app")
      )
    }
  }

  deinit {
    stopWatchingFolders()

    // Remove wake observer
    if let observer = wakeObserver {
      NSWorkspace.shared.notificationCenter.removeObserver(observer)
      wakeObserver = nil
    }
  }

  // Start watching application directories for changes
  public func startWatchingFolders() {
    if isWatchingFolders {
      return
    }

    do {
      // Get all the application directories we want to watch
      let directoriesUrls = try getApplicationDirectories()
      for url in directoriesUrls {
        watchedDirectories.append(url.path)
      }

      var context = FSEventStreamContext(
        version: 0,
        info: Unmanaged.passUnretained(self).toOpaque(),
        retain: nil,
        release: nil,
        copyDescription: nil
      )

      let callback: FSEventStreamCallback = {
        (
          streamRef: ConstFSEventStreamRef,
          clientCallBackInfo: UnsafeMutableRawPointer?,
          numEvents: Int,
          eventPaths: UnsafeMutableRawPointer,
          eventFlags: UnsafePointer<FSEventStreamEventFlags>,
          eventIds: UnsafePointer<FSEventStreamEventId>
        ) in

        guard let info = clientCallBackInfo else { return }
        let myself = Unmanaged<ApplicationSearcher>.fromOpaque(info)
          .takeUnretainedValue()

        // Notify if a file was added, removed, renamed, or inode metadata changed
        for i in 0..<numEvents {
          let flags = eventFlags[i]
          if (flags & UInt32(kFSEventStreamEventFlagItemCreated) != 0)
            || (flags & UInt32(kFSEventStreamEventFlagItemRemoved) != 0)
            || (flags & UInt32(kFSEventStreamEventFlagItemRenamed) != 0)
            || (flags & UInt32(kFSEventStreamEventFlagItemInodeMetaMod) != 0)
          {
            myself.processFileChanges()
            break
          }
        }
      }

      let pathsToWatch = watchedDirectories as CFArray

      // Create event stream
      eventStream = FSEventStreamCreate(
        kCFAllocatorDefault,
        callback,
        &context,
        pathsToWatch,
        FSEventStreamEventId(kFSEventStreamEventIdSinceNow),
        10.0,
        FSEventStreamCreateFlags(kFSEventStreamCreateFlagFileEvents)
      )

      if let eventStream = eventStream {
        let backgroundQueue = DispatchQueue(
          label: "com.sol.fsevents", qos: .utility)
        FSEventStreamSetDispatchQueue(eventStream, backgroundQueue)
        FSEventStreamStart(eventStream)
        isWatchingFolders = true
      }
    } catch {
      print("💔 Could not watch applications")
    }
  }

  public func stopWatchingFolders() {
    if let eventStream = eventStream, isWatchingFolders {
      FSEventStreamStop(eventStream)
      FSEventStreamInvalidate(eventStream)
      FSEventStreamRelease(eventStream)
      self.eventStream = nil
      isWatchingFolders = false
    }

    watchedDirectories.removeAll()
  }

  // Restart FSEventStream after wake
  private func handleWakeFromSleep() {
    stopWatchingFolders()
    startWatchingFolders()
  }

  private var debounceWorkItem: DispatchWorkItem?

  private func processFileChanges() {
    debounceWorkItem?.cancel()

    let workItem = DispatchWorkItem { [weak self] in
      guard let self = self else { return }

      DispatchQueue.main.async {
        self.onApplicationsChanged?()
      }
    }

    debounceWorkItem = workItem
    DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + 1.0, execute: workItem)
  }

  private func getApplicationDirectories() throws -> [URL] {
    var directories: [URL] = []

    // Get local application directory
    if let localApplicationUrl = try? FileManager.default.url(
      for: .applicationDirectory,
      in: .localDomainMask,
      appropriateFor: nil,
      create: false
    ) {
      directories.append(localApplicationUrl)
    }

    // Get system application directory
    if let systemApplicationUrl = try? FileManager.default.url(
      for: .applicationDirectory,
      in: .systemDomainMask,
      appropriateFor: nil,
      create: false
    ) {
      directories.append(systemApplicationUrl)
    }

    // Get user application directory
    if let userApplicationUrl = try? FileManager.default.url(
      for: .applicationDirectory,
      in: .userDomainMask,
      appropriateFor: nil,
      create: false
    ) {
      directories.append(userApplicationUrl)
    }

    return directories
  }

  @objc public func getAllApplications() -> [[String: Any]] {
    var appUrls: [URL] = []
    appUrls.append(contentsOf: fixedUrls)

    let runningApps = NSWorkspace.shared.runningApplications

    do {
      let directories = try getApplicationDirectories()
      for directory in directories {
        appUrls.append(contentsOf: getApplicationUrlsAt(directory))
      }
    } catch {
      let breadcrumb = Breadcrumb(level: .info, category: "custom")
      breadcrumb.message = "Error getting all applications at localDomainMask"
      TelemetryManager.shared.addBreadcrumb(breadcrumb)
      TelemetryManager.shared.captureError(error)
    }

    var applications = [String: Application]()

    for var url in appUrls {
      do {
        let resourceValues = try url.resourceValues(
          forKeys: Set(isAliasResourceKey))
        if resourceValues.isAliasFile! {
          url = try URL(resolvingAliasFileAt: url)
        }
      } catch {
        // Could not resolve an alias file. More than likely just a dangling alias from a botched de-installation
        continue
      }

      do {
        // File doesn't exist but it was listed?! I don't know how this is happening but it does
        // at least on sentry it is showing
        if !fileManager.fileExists(atPath: url.path) {
          continue
        }

        let resourceValues = try url.resourceValues(forKeys: Set(resourceKeys))

        if resourceValues.isExecutable! && resourceValues.isApplication! {
          let name = url.deletingPathExtension().lastPathComponent
          var localizedName = name
          if let mdItem = MDItemCreateWithURL(nil, url as CFURL),
            let displayName = MDItemCopyAttribute(mdItem, kMDItemDisplayName) as? String
          {
            localizedName =
              displayName.hasSuffix(".app") ? String(displayName.dropLast(4)) : displayName
          }
          let urlStr = url.absoluteString

          applications[urlStr] = Application(
            name: name, localizedName: localizedName, url: urlStr, isRunning: false)
        }
      } catch {
        let breadcrumb = Breadcrumb(level: .info, category: "custom")
        breadcrumb.message =
          "Error resolving info for application at \(url): \(error.localizedDescription)"
        TelemetryManager.shared.addBreadcrumb(breadcrumb)
        TelemetryManager.shared.captureError(error)
      }
    }

    // Iterate through the running apps and mark those running
    for runningApp in runningApps {
      if let runningBundleUrl = runningApp.bundleURL?.absoluteString {
        if let application = applications[runningBundleUrl] {
          application.isRunning = true
        }
      }
    }

    return applications.values.map { $0.toDictionary() }
  }

  private func getApplicationUrlsAt(_ url: URL, depth: Int = 0) -> [URL] {
    if !fileManager.fileExists(atPath: url.path) {
      return []
    }

    if depth > searchDepth {
      return []
    }

    if ignoredPatterns.contains(url.lastPathComponent) {
      return []
    }

    if url.pathExtension == "app" {
      return [url]
    }

    // Check if this is a symbolic link and resolve it
    var resolvedUrl = url
    do {
      let resourceValues = try url.resourceValues(forKeys: Set([.isSymbolicLinkKey]))
      if resourceValues.isSymbolicLink == true {
        resolvedUrl = url.resolvingSymlinksInPath()

        // Check if the resolved path still exists and is not in ignored patterns
        if !fileManager.fileExists(atPath: resolvedUrl.path) {
          return []
        }

        if ignoredPatterns.contains(resolvedUrl.lastPathComponent) {
          return []
        }

        // If the symbolic link points to an app, return it
        if resolvedUrl.pathExtension == "app" {
          return [resolvedUrl]
        }
      }
    } catch {
      // If we can't determine if it's a symbolic link, continue with the original URL
    }

    do {
      if resolvedUrl.hasDirectoryPath {
        var urls: [URL] = []
        let contents = try fileManager.contentsOfDirectory(
          at: resolvedUrl,
          includingPropertiesForKeys: [],
          options: [
            .skipsSubdirectoryDescendants,
            .skipsPackageDescendants,
          ]
        )

        contents.forEach {
          let subUrls = getApplicationUrlsAt($0, depth: depth + 1)
          urls.append(contentsOf: subUrls)
        }

        return urls
      } else {
        return []
      }
    } catch {
      let nsError = error as NSError

      // Silently ignore permission errors
      if nsError.domain == NSCocoaErrorDomain
        && nsError.code == NSFileReadNoPermissionError
      {
        return []
      }

      // Silently ignore "file not found" errors - these occur with broken symlinks
      // or race conditions where files are deleted between directory listing and access
      if nsError.domain == NSPOSIXErrorDomain && nsError.code == 2 {
        return []
      }
      if nsError.domain == NSCocoaErrorDomain && nsError.code == NSFileReadNoSuchFileError {
        return []
      }

      let breadcrumb = Breadcrumb(level: .info, category: "custom")
      breadcrumb.message =
        "Could not resolve apps url at \(url): \(error.localizedDescription)"
      TelemetryManager.shared.addBreadcrumb(breadcrumb)
      TelemetryManager.shared.captureError(error)
      return []
    }
  }
}
