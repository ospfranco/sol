import Cocoa

class ApplicationSearcher: NSObject {
  var fixedApps: [URL] = [
    URL(fileURLWithPath: "/System/Library/CoreServices/Finder.app"),
  ]

  override init() {
    super.init()
    if #unavailable(macOS 14) {
      fixedApps.append(
        URL(
          fileURLWithPath: "/System/Library/CoreServices/Applications/Screen Sharing.app"
        )
      )
    }
  }

  public func getAllApplications() -> [Application] {
    do {
      let runningApps = NSWorkspace.shared.runningApplications
      let localApplicationUrl = try FileManager.default.url(
        for: .applicationDirectory,
        in: .localDomainMask,
        appropriateFor: nil,
        create: false
      )
      let localApplicationUrls = getApplicationUrlsAt(localApplicationUrl)
      let systemApplicationUrl = try FileManager.default.url(
        for: .applicationDirectory,
        in: .systemDomainMask,
        appropriateFor: nil,
        create: false
      )
      let systemApplicationsUrls = getApplicationUrlsAt(systemApplicationUrl)
      let userApplicationUrl = try FileManager.default.url(
        for: .applicationDirectory,
        in: .userDomainMask,
        appropriateFor: nil,
        create: false
      )
      let personalApplicationUrls = getApplicationUrlsAt(userApplicationUrl)

      let allApplicationUrls =
        localApplicationUrls + systemApplicationsUrls +
        personalApplicationUrls +
        fixedApps

      var applications = [Application]()

      for url in allApplicationUrls {
        let resourceKeys: [URLResourceKey] = [
          .isExecutableKey,
          .isApplicationKey,
        ]
        let resourceValues = try url.resourceValues(forKeys: Set(resourceKeys))
        if resourceValues.isExecutable ?? false {
          let name = url.deletingPathExtension().lastPathComponent
          let urlStr = url.absoluteString
          let firstRunning = runningApps.first(where: {
            $0.bundleURL?.absoluteString == urlStr
          })

          applications.append(Application(
            name: name,
            url: urlStr,
            isRunning: firstRunning != nil
          ))
        }
      }

      return applications
    } catch {
      print("Could not get applications! \(error)")
      return []
    }
  }

  private func getApplicationUrlsAt(_ url: URL) -> [URL] {
    let fileManager = FileManager()
    do {
      if !url.path.contains(".app") && url.hasDirectoryPath {
        var urls = try fileManager.contentsOfDirectory(
          at: url,
          includingPropertiesForKeys: [],
          options: [
            FileManager.DirectoryEnumerationOptions.skipsPackageDescendants,
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
      return []
    }
  }
}

struct Application {
  var name: String
  var url: String
  var isRunning: Bool
}
