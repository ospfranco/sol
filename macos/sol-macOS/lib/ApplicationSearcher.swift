import Cocoa
import Sentry

struct Application {
  var name: String
  var url: String
  var isRunning: Bool
}

class ApplicationSearcher: NSObject {
  let fileManager = FileManager()
  let isAliasResourceKey: [URLResourceKey] = [
    .isAliasFileKey
  ]
  let resourceKeys: [URLResourceKey] = [
    .isExecutableKey,
    .isApplicationKey,
  ]

  var fixedUrls: [URL] = [
    URL(fileURLWithPath: "/System/Library/CoreServices/Finder.app")
  ]

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

  public func getAllApplications() throws -> [Application] {
    var appUrls: [URL] = []
    appUrls.append(contentsOf: fixedUrls)
    let runningApps = NSWorkspace.shared.runningApplications

    do {
      let localApplicationUrl = try FileManager.default.url(
        for: .applicationDirectory,
        in: .localDomainMask,
        appropriateFor: nil,
        create: false
      )
      appUrls.append(contentsOf: getApplicationUrlsAt(localApplicationUrl))
    } catch {
      let breadcrumb = Breadcrumb(level: .info, category: "custom")
      breadcrumb.message = "Error getting all applications at localDomainMask"
      SentrySDK.addBreadcrumb(breadcrumb)
      SentrySDK.capture(error: error)
    }

    do {
      let systemApplicationUrl = try FileManager.default.url(
        for: .applicationDirectory,
        in: .systemDomainMask,
        appropriateFor: nil,
        create: false
      )
      appUrls.append(contentsOf: getApplicationUrlsAt(systemApplicationUrl))
      let breadcrumb = Breadcrumb(level: .info, category: "custom")
      breadcrumb.message =
        "Apps at system domain mask: \(systemApplicationUrl.path), apps: \(getApplicationUrlsAt(systemApplicationUrl))"
      SentrySDK.addBreadcrumb(breadcrumb)
    } catch {
      let breadcrumb = Breadcrumb(level: .info, category: "custom")
      breadcrumb.message = "Error getting all applications at systemApplicationUrl"
      SentrySDK.addBreadcrumb(breadcrumb)
      SentrySDK.capture(error: error)
    }

    do {
      let userApplicationUrl = try FileManager.default.url(
        for: .applicationDirectory,
        in: .userDomainMask,
        appropriateFor: nil,
        create: false
      )
      appUrls.append(contentsOf: getApplicationUrlsAt(userApplicationUrl))
    } catch {
      let breadcrumb = Breadcrumb(level: .info, category: "custom")
      breadcrumb.message = "Error getting all applications at userDomainMask"
      SentrySDK.addBreadcrumb(breadcrumb)
      SentrySDK.capture(error: error)
    }

    var applications = [Application]()

    for var url in appUrls {
      do {
        let resourceValues = try url.resourceValues(forKeys: Set(isAliasResourceKey))
        if resourceValues.isAliasFile! {
          url = try URL(resolvingAliasFileAt: url)
          if !fileManager.fileExists(atPath: url.path) {
            let bc = Breadcrumb(level: .info, category: "custom")
            let path = url.path
            bc.message = "Alias file at \(path) does not exist."
            SentrySDK.addBreadcrumb(bc)
            continue
          }
        }
      } catch {
        let bc = Breadcrumb(level: .info, category: "custom")
        bc.message = "Could not resolve alias file at \(url)."
        SentrySDK.addBreadcrumb(bc)
        SentrySDK.capture(error: error)
      }
      
      do {
        let resourceValues = try url.resourceValues(forKeys: Set(resourceKeys))

        if resourceValues.isExecutable! && resourceValues.isApplication! {
          let name = url.deletingPathExtension().lastPathComponent
          let urlStr = url.absoluteString
          let isRunning =
            runningApps.first(where: {
              $0.bundleURL?.absoluteString == urlStr
            }) != nil

          applications.append(
            Application(
              name: name,
              url: urlStr,
              isRunning: isRunning
            ))
        }
      } catch {
        print("Could not resolve app url at \(url).")
        let breadcrumb = Breadcrumb(level: .info, category: "custom")
        breadcrumb.message =
          "Error resolving info for application at \(url): \(error.localizedDescription)"
        SentrySDK.addBreadcrumb(breadcrumb)
        SentrySDK.capture(error: error)
      }
    }

    return applications
  }

  private func getApplicationUrlsAt(_ url: URL) -> [URL] {
    do {
      if !url.path.contains(".app") && url.hasDirectoryPath {
        var urls: [URL] = []
        let contents = try fileManager.contentsOfDirectory(
          at: url,
          includingPropertiesForKeys: [],
          options: [
            .skipsSubdirectoryDescendants,
            .skipsPackageDescendants,
            .skipsHiddenFiles,
          ]
        )

        contents.forEach {
          if !$0.path.contains(".app") && $0.hasDirectoryPath {
            let subUrls = getApplicationUrlsAt($0)
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
      print("Could not resolve apps url at \(url): \(error.localizedDescription)")
      let breadcrumb = Breadcrumb(level: .info, category: "custom")
      breadcrumb.message = "Could not resolve apps url at \(url): \(error.localizedDescription)"
      SentrySDK.addBreadcrumb(breadcrumb)
      SentrySDK.capture(error: error)
      return []
    }
  }
}
