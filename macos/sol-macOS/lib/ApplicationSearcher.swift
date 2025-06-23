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

@objc public class ApplicationSearcher: NSObject {
  let searchDepth = 4
  let fileManager = FileManager()
  
  let isAliasResourceKey: [URLResourceKey] = [
    .isAliasFileKey
  ]
  
  let resourceKeys: [URLResourceKey] = [
    .isExecutableKey,
    .isApplicationKey,
  ]

  @objc public static let shared = ApplicationSearcher()

  // File watching
  private var eventStream: FSEventStreamRef?
  private var lastApplications: [[String: Any]] = []
  private var isWatchingFolders = false

  // Callback for application changes
  public var onApplicationsChanged: (() -> Void)?

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
    
    if #available(macOS 15, *) {
      fixedUrls.append(
        URL(fileURLWithPath: "/System/Library/CoreServices/Applications/Keychain Access.app")
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
      lastApplications = getAllApplications()

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
        10.0,
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
      self.onApplicationsChanged?()
    }
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
      SentrySDK.addBreadcrumb(breadcrumb)
      SentrySDK.capture(error: error)
    }

    var applications = [String:Application]()

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
          
          applications[urlStr] = Application(name: name, url: urlStr, isRunning: false)
        }
      } catch {
        let breadcrumb = Breadcrumb(level: .info, category: "custom")
        breadcrumb.message =
          "Error resolving info for application at \(url): \(error.localizedDescription)"
        SentrySDK.addBreadcrumb(breadcrumb)
        SentrySDK.capture(error: error)
      }
    }
    
    // Iterate through the running apps and mark those running
    for runningApp in runningApps {
      if let runningBundleUrl = runningApp.bundleURL?.absoluteString {
        if let application =  applications[runningBundleUrl] {
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
