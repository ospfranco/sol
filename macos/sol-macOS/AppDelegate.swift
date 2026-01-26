import EventKit
import Foundation
import React_RCTAppDelegate
import Sparkle

@NSApplicationMain
@objc
class AppDelegate: RCTAppDelegate {
  private var updaterController: SPUStandardUpdaterController!
  private var mediaKeyForwarder: MediaKeyForwarder!

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
    ClipboardHelper.addOnCopyListener {
      // Skip if we're currently pasting (prevents infinite loop)
      if ClipboardHelper.isPasting {
        return
      }

      let bundle = $1?.bundle

      // Check for image data in multiple formats (screenshots, copied images)
      // Order matters: prefer lossless formats first
      let imageTypes: [NSPasteboard.PasteboardType] = [.png, .tiff]
      for imageType in imageTypes {
        if let imageData = $0.data(forType: imageType),
           let image = NSImage(data: imageData),
           image.size.width > 0, image.size.height > 0 {
          self.handleImageCopy(image: image, bundle: bundle)
          return
        }
      }

      let data = $0.data(forType: .fileURL)

      if data != nil {
        // Copy the file url to temp directory
        do {
          guard let filename = $0.string(forType: .string) else {
            print("Could not get file name")
            return
          }
          guard
            let url = URL(
              dataRepresentation: data!,
              relativeTo: nil
            )
          else {
            print("COuld not get file url")
            return
          }

          let tempFile = NSTemporaryDirectory() + filename
          // Copy the file to the temp dir
          try FS.copyFileFromUrl(url, toPath: tempFile)
          SolEmitter.sharedInstance.fileCopied(filename, tempFile, bundle)
        } catch {
          let errorDesc = error.localizedDescription
          print("Could not copy file to temp folder \(errorDesc)")
        }
        return
      }

      // Try to parse first as string
      let txt = $0.string(forType: .string)
      if txt != nil {
        SolEmitter.sharedInstance.textCopied(txt!, bundle)
      }
    }
  }

  private func handleImageCopy(image: NSImage, bundle: String?) {
    // Validate image dimensions
    guard image.size.width > 0, image.size.height > 0 else {
      print("Invalid image dimensions")
      return
    }

    // Skip very large images (> 50MB estimated) to prevent memory issues
    let estimatedSize = image.size.width * image.size.height * 4 // RGBA bytes
    guard estimatedSize < 50_000_000 else {
      print("Image too large, skipping clipboard capture")
      return
    }

    let timestamp = Int(Date().timeIntervalSince1970 * 1000)

    // Use temp directory - OS handles cleanup, prevents disk bloat
    let imagesDir = FileConstants.tempURL.appendingPathComponent("sol-clipboard-images", isDirectory: true)

    do {
      try FileManager.default.createDirectory(at: imagesDir, withIntermediateDirectories: true)
    } catch {
      print("Could not create clipboard images directory: \(error)")
      return
    }

    let imagePath = imagesDir.appendingPathComponent("img_\(timestamp).png")
    let thumbPath = imagesDir.appendingPathComponent("thumb_\(timestamp).png")

    // Generate thumbnail (64x64 max)
    guard let thumbnail = image.resizeMaintainingAspectRatio(withSize: NSSize(width: 64, height: 64)) else {
      print("Failed to generate thumbnail")
      return
    }

    do {
      try image.savePngTo(url: imagePath)
      try thumbnail.savePngTo(url: thumbPath)

      // Convert thumbnail to base64 for React Native Image
      guard let thumbData = thumbnail.PNGRepresentation else {
        print("Failed to get PNG representation of thumbnail")
        return
      }
      let thumbnailBase64 = "data:image/png;base64," + thumbData.base64EncodedString()

      // Create a descriptive name based on image dimensions and source
      let width = Int(image.size.width)
      let height = Int(image.size.height)
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "HH:mm"
      let timeStr = dateFormatter.string(from: Date())
      let imageName = "Screenshot \(width)×\(height) at \(timeStr)"

      SolEmitter.sharedInstance.imageCopied(imagePath.path, thumbPath.path, thumbnailBase64, imageName, bundle)
    } catch {
      print("Failed to save clipboard image: \(error)")
    }
  }

  func setMediaKeyForwardingEnabled(_ enabled: Bool) {
    if enabled {
      mediaKeyForwarder?.startEventSession()
    } else {
      mediaKeyForwarder?.stopEventSession()
    }
  }

}
