import Cocoa
import CoreServices
import Sentry

class Application {
  public var name: String
  public var url: String
  public var isRunning: Bool

  init(name: String, url: String, isRunning: Bool) {
    self.name = name
    self.url = url
    self.isRunning = isRunning
  }

  func toDictionary() -> [String: Any] {
    return [
      "name": name,
      "url": url,
      "isRunning": isRunning,
    ]
  }
}

class ApplicationSearcher: NSObject {
  let searchDepth = 4
  let fileManager = FileManager()
  let isAliasResourceKey: [URLResourceKey] = [
    .isAliasFileKey
  ]
  let resourceKeys: [URLResourceKey] = [
    .isExecutableKey,
    .isApplicationKey,
  ]

  // File watching
  private var eventStream: FSEventStreamRef?
  private var lastApplications: [Application] = []
  private var isWatchingFolders = false

  // Callback for application changes
  public var onApplicationsChanged: (([Application]) -> Void)?

  var fixedUrls: [URL] = [
    URL(fileURLWithPath: "/System/Library/CoreServices/Finder.app")
  ]

  // Application directories to watch
  private var watchedDirectories: [String] = []

  override init() {
    super.init()
    if #unavailable(macOS 14) {
      fixedUrls.append(
        URL(
          fileURLWithPath: "/System/Library/CoreServices/Applications/Screen Sharing.app"
        )
      )
    }
  }

  deinit {
    stopWatchingFolders()
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

      // Get initial applications
      lastApplications = try getAllApplications()

      // Set up the FSEvents stream
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
        // Get reference to self from context
        guard let info = clientCallBackInfo else { return }
        let myself = Unmanaged<ApplicationSearcher>.fromOpaque(info).takeUnretainedValue()

        // Process file changes
        myself.processFileChanges()
      }

      // Create paths array for FSEvents
      let pathsToWatch = watchedDirectories as CFArray

      // Create event stream
      eventStream = FSEventStreamCreate(
        kCFAllocatorDefault,
        callback,
        &context,
        pathsToWatch,
        FSEventStreamEventId(kFSEventStreamEventIdSinceNow),
        30.0,
        FSEventStreamCreateFlags(kFSEventStreamCreateFlagFileEvents)
      )

      if let eventStream = eventStream {
        let backgroundQueue = DispatchQueue(label: "com.sol.fsevents", qos: .utility)
        FSEventStreamSetDispatchQueue(eventStream, backgroundQueue)
        FSEventStreamStart(eventStream)
        isWatchingFolders = true
      }
    } catch {
      let breadcrumb = Breadcrumb(level: .error, category: "custom")
      breadcrumb.message =
        "Failed to start watching application folders: \(error.localizedDescription)"
      SentrySDK.addBreadcrumb(breadcrumb)
      SentrySDK.capture(error: error)
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
  }

  private func processFileChanges() {
    // Delay processing to batch events together
    DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + 1.0) { [weak self] in
      guard let self = self else { return }

      do {
        // Get current applications
        let currentApplications = try self.getAllApplications()

        // More sophisticated comparison than just count
        let hasChanges = self.detectSignificantChanges(
          old: self.lastApplications, new: currentApplications)

        if hasChanges {
          self.lastApplications = currentApplications
          // Dispatch UI updates to main thread
          DispatchQueue.main.async {
            self.onApplicationsChanged?(currentApplications)
          }
        }
      } catch {
        let breadcrumb = Breadcrumb(level: .error, category: "custom")
        breadcrumb.message = "Error processing application changes: \(error.localizedDescription)"
        SentrySDK.addBreadcrumb(breadcrumb)
        SentrySDK.capture(error: error)
      }
    }
  }

  private func detectSignificantChanges(old: [Application], new: [Application]) -> Bool {
    // Check count first as it's fastest
    if old.count != new.count { return true }

    // Create sets of application URLs for quick comparison
    let oldUrls = Set(old.map { $0.url })
    let newUrls = Set(new.map { $0.url })

    // Check if any applications were added or removed
    if oldUrls != newUrls { return true }

    // Check for running state changes
    for (oldApp, newApp) in zip(old, new) where oldApp.url == newApp.url {
      if oldApp.isRunning != newApp.isRunning { return true }
    }

    return false
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

  public func getAllApplications() throws -> [Application] {
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
      SentrySDK.addBreadcrumb(breadcrumb)
      SentrySDK.capture(error: error)
    }

    var applications = [Application]()

    for var url in appUrls {
      do {
        let resourceValues = try url.resourceValues(forKeys: Set(isAliasResourceKey))
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
          let urlStr = url.absoluteString
          let isRunning =
            runningApps.first(where: {
              $0.bundleURL?.absoluteString == urlStr
            }) != nil

          applications.append(
            Application(name: name, url: urlStr, isRunning: isRunning)
          )
        }
      } catch {
        let breadcrumb = Breadcrumb(level: .info, category: "custom")
        breadcrumb.message =
          "Error resolving info for application at \(url): \(error.localizedDescription)"
        SentrySDK.addBreadcrumb(breadcrumb)
        SentrySDK.capture(error: error)
      }
    }

    return applications
  }

  private func getApplicationUrlsAt(_ url: URL, depth: Int = 0) -> [URL] {
    if !fileManager.fileExists(atPath: url.path) {
      return []
    }

    if depth > searchDepth {
      return []
    }

    do {
      if !url.path.contains(".app") && url.hasDirectoryPath {
        var urls: [URL] = []
        let contents = try fileManager.contentsOfDirectory(
          at: url,
          includingPropertiesForKeys: [],
          options: [
            .skipsSubdirectoryDescendants,
            .skipsPackageDescendants,
            //            .skipsHiddenFiles, do not skip hidden files, then safari is not listed
          ]
        )

        contents.forEach {
          if !$0.path.contains(".app") && $0.hasDirectoryPath {
            let subUrls = getApplicationUrlsAt($0, depth: depth + 1)
            urls.append(contentsOf: subUrls)
          } else {
            urls.append($0)
          }
        }

        return urls
      } else {
        return [url]
      }
    } catch {
      if (error as NSError).domain == NSCocoaErrorDomain
        && (error as NSError).code == NSFileReadNoPermissionError
      {
        return []
      }

      let breadcrumb = Breadcrumb(level: .info, category: "custom")
      breadcrumb.message = "Could not resolve apps url at \(url): \(error.localizedDescription)"
      SentrySDK.addBreadcrumb(breadcrumb)
      SentrySDK.capture(error: error)
      return []
    }
  }
}
