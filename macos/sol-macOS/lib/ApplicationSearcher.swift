import Cocoa
import Sentry

class ApplicationSearcher: NSObject {
  let fileManager = FileManager()
  let resourceKeys: [URLResourceKey] = [
    .isExecutableKey,
    .isApplicationKey,
    .isAliasFileKey,
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
        let resourceValues = try url.resourceValues(forKeys: Set(resourceKeys))
        if resourceValues.isAliasFile! {
          let original = try URL(resolvingAliasFileAt: url)
          url = URL(fileURLWithPath: original.path)
        }

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
        let breadcrumb = Breadcrumb(level: .info, category: "custom")
        breadcrumb.message = "Error resolving info for application at \(url)"
        SentrySDK.addBreadcrumb(breadcrumb)
        SentrySDK.capture(error: error)
      }
    }

    return applications
  }

  private func getApplicationUrlsAt(_ url: URL) -> [URL] {

    do {
      if !url.path.contains(".app") && url.hasDirectoryPath {
        var urls = try fileManager.contentsOfDirectory(
          at: url,
          includingPropertiesForKeys: [],
          options: [
            FileManager.DirectoryEnumerationOptions.skipsPackageDescendants
          ]
        )

        urls.forEach {
          if !$0.path.contains(".app") && $0.hasDirectoryPath {
            let subUrls = getApplicationUrlsAt($0)

            urls.append(contentsOf: subUrls)
          }
        }

        return urls
      } else {
        return [url]
      }
    } catch {
      SentrySDK.capture(error: error)
      return []
    }
  }
}

struct Application {
  var name: String
  var url: String
  var isRunning: Bool
}
