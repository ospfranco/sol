import EventKit
import Foundation
import React_RCTAppDelegate
import Sparkle

@NSApplicationMain
@objc
class AppDelegate: RCTAppDelegate {
  private var updaterController: SPUStandardUpdaterController!
  private var mediaKeyForwarder: MediaKeyForwarder!
  private let imagesPasteboardDirectory: URL = {
    let home = FileManager.default.homeDirectoryForCurrentUser
    return home
      .appendingPathComponent(".config", isDirectory: true)
      .appendingPathComponent("sol", isDirectory: true)
      .appendingPathComponent("images_pasteboard", isDirectory: true)
  }()
  private let supportedClipboardImageTypes: [(type: NSPasteboard.PasteboardType, ext: String)] = [
    (.png, "png"),
    (NSPasteboard.PasteboardType("public.jpeg"), "jpeg"),
    (.tiff, "tiff"),
  ]
  private let supportedImageFileExtensions = Set(["png", "jpg", "jpeg"])

  override init() {
    updaterController = SPUStandardUpdaterController(
      startingUpdater: true,
      updaterDelegate: nil,
      userDriverDelegate: nil
    )
    super.init()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func bridgelessEnabled() -> Bool {
    return false
  }

  override func applicationShouldHandleReopen(
    _: NSApplication,
    hasVisibleWindows _: Bool
  ) -> Bool {
    PanelManager.shared.showWindow()
    return true
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }

  override func customize(_ rootView: RCTRootView) {
    rootView.wantsLayer = true
    rootView.backgroundColor = .clear
    rootView.layer?.backgroundColor = .clear
  }

  override func applicationDidFinishLaunching(_ notification: Notification) {
    self.moduleName = "sol"
    self.initialProps = [:]
    self.automaticallyLoadReactNativeWindow = false

    super.applicationDidFinishLaunching(notification)

    let rootView = self.rootViewFactory().view(withModuleName: "sol")

    PanelManager.shared.setRootView(rootView)

    setupPasteboardListener()

    mediaKeyForwarder = MediaKeyForwarder()

    PanelManager.shared.showWindow()
  }

  func checkForUpdates() {
    DispatchQueue.main.async {
      self.updaterController.checkForUpdates(self)
    }
  }

  func setupPasteboardListener() {
    createImagesPasteboardDirectoryIfNeeded()

    ClipboardHelper.addOnCopyListener {
      let pasteboard = $0
      let bundle = $1?.bundle

      // Prioritize image payloads over string payloads so copied images are
      // persisted and surfaced in Sol clipboard history.
      if self.persistClipboardImageIfNeeded(from: pasteboard, bundle: bundle) {
        return
      }

      let data = pasteboard.data(forType: .fileURL)

      if data != nil {
        // Copy the file url to temp directory
        do {
          guard
            let url = URL(
              dataRepresentation: data!,
              relativeTo: nil
            )
          else {
            print("COuld not get file url")
            return
          }

          let fileName = url.lastPathComponent
          let fileExtension = url.pathExtension.lowercased()

          if self.supportedImageFileExtensions.contains(fileExtension) {
            let destinationFileName = "img_\(UUID().uuidString).\(fileExtension)"
            let destination = self.imagesPasteboardDirectory
              .appendingPathComponent(destinationFileName)

            try FS.copyFileFromUrl(url, toPath: destination.path)
            SolEmitter.sharedInstance.fileCopied(destinationFileName, destination.path, bundle)
          } else {
            let tempFile = NSTemporaryDirectory() + fileName
            // Copy non-image files to temp dir like before.
            try FS.copyFileFromUrl(url, toPath: tempFile)
            SolEmitter.sharedInstance.fileCopied(fileName, tempFile, bundle)
          }
        } catch {
          let errorDesc = error.localizedDescription
          print("Could not copy file to temp folder \(errorDesc)")
        }
        return
      }

      // Try to parse first as string
      let txt = pasteboard.string(forType: .string)
      if txt != nil {
        SolEmitter.sharedInstance.textCopied(txt!, bundle)
      }
    }
  }

  private func createImagesPasteboardDirectoryIfNeeded() {
    do {
      try FileManager.default.createDirectory(
        at: imagesPasteboardDirectory,
        withIntermediateDirectories: true,
        attributes: nil
      )
    } catch {
      print("Could not create images pasteboard directory: \(error.localizedDescription)")
    }
  }

  private func persistClipboardImageIfNeeded(from pasteboard: NSPasteboard, bundle: String?) -> Bool {
    for (pasteboardType, ext) in supportedClipboardImageTypes {
      guard let data = pasteboard.data(forType: pasteboardType) else {
        continue
      }

      do {
        let fileName = "img_\(UUID().uuidString).\(ext)"
        let destination = imagesPasteboardDirectory.appendingPathComponent(fileName)

        // Persist original pasteboard bytes without format conversion.
        try data.write(to: destination, options: .atomic)

        SolEmitter.sharedInstance.fileCopied(fileName, destination.path, bundle)
        return true
      } catch {
        print("Could not persist pasted image: \(error.localizedDescription)")
      }
    }

    return false
  }

  func setMediaKeyForwardingEnabled(_ enabled: Bool) {
    if enabled {
      mediaKeyForwarder?.startEventSession()
    } else {
      mediaKeyForwarder?.stopEventSession()
    }
  }

}
