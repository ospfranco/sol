// Modified class taken from https://github.com/jacklandrin/OnlySwitch/blob/main/OnlySwitch/EverySwitch/TopNotchSwitch.swift
// All rights to the author

// TODO this is meant to hide all bars not only the notch
// Replace the names properly

import AVFoundation
import Cocoa
import UniformTypeIdentifiers

class NotchHelper {

  private var currentImageName = ""

  private var myAppPath:URL? {
    let appBundleID = Bundle.main.infoDictionary?["CFBundleName"] as! String
    let paths = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)
    let directory = paths.first
    let myAppPath = directory?.appendingPathComponent(appBundleID)
    return myAppPath
  }

  private func recoverNotch(screen: NSScreen) {
    let originalPath = myAppPath?.appendingPathComponent("original").appendingPathComponent(currentImageName)
    guard let originalPath = originalPath else {return}
    setDesktopImageURL(url: originalPath, screen: screen)
  }

  func hideNotch() {
    let workspace = NSWorkspace.shared
    for screen in NSScreen.screens {
      guard let path = workspace.desktopImageURL(for: screen) else {
        return
      }

      let appBundleID = Bundle.main.infoDictionary?["CFBundleName"] as! String
      if let myAppPath = myAppPath, path.absoluteString.contains("/\(appBundleID)/original") {
        currentImageName = URL(fileURLWithPath: path.absoluteString).lastPathComponent
        let processdUrl = myAppPath.appendingPathComponent("processed").appendingPathComponent(currentImageName)
        if FileManager.default.fileExists(atPath: processdUrl.path) {
          setDesktopImageURL(url: processdUrl, screen: screen)
          return
        }
      }
      //      print("original path:\(path)")
      guard let currentWallpaperImage = NSImage(contentsOf: path) else {
        return
      }

      if path.pathExtension == "heic" {
        var metaDataTag:HeicMetaDataTag?
        do {
          let imagaDate = try Data(contentsOf: path)
          metaDataTag = try extractMetaData(imageData: imagaDate)
        } catch {
          return
        }

        guard let metaDataTag = metaDataTag else {
          return
        }

        hideHeicDesktopNotch(image: currentWallpaperImage, metaDataTag: metaDataTag, screen: screen)
      } else {
        hideSingleDesktopNotch(image: currentWallpaperImage, screen: screen)
      }
    }
  }

  private func extractMetaData(imageData:Data) throws -> HeicMetaDataTag {
    let imageSource = CGImageSourceCreateWithData(imageData as CFData, nil)
    guard let imageSourceValue = imageSource else {
      throw MetadataExtractorError.imageSourceNotCreated
    }

    let imageMetadata = CGImageSourceCopyMetadataAtIndex(imageSourceValue, 0, nil)
    guard let imageMetadataValue = imageMetadata else {
      throw MetadataExtractorError.imageMetadataNotCreated
    }
    var tagType:String = ""
    var plist:String = ""
    CGImageMetadataEnumerateTagsUsingBlock(imageMetadataValue, nil, nil) { (value, metadataTag) -> Bool in

      let valueString = value as String
      print("---------------------------------------------------")
      print("Metadata key: \(valueString)")

      let tag = CGImageMetadataTagCopyValue(metadataTag)

      guard let valueTag = tag as? String else {
        print("\tError during convert tag into string")
        return true
      }
      print(valueTag)
      if valueString.starts(with: "apple_desktop:solar") {
        tagType = "solar"
        plist = valueTag
      } else if valueString.starts(with: "apple_desktop:h24") {
        tagType = "h24"
        plist = valueTag
      } else if valueString.starts(with: "apple_desktop:apr") {
        tagType = "apr"
        plist = valueTag
      }
      return true
    }
    return HeicMetaDataTag(type: tagType, plist: plist)
  }

  private func hideHeicDesktopNotch(image:NSImage, metaDataTag:HeicMetaDataTag, screen: NSScreen) {
    let imageReps = image.representations
    if imageReps.count == 1 && metaDataTag.type == "" {
      hideSingleDesktopNotch(image: image, screen: screen)
      return
    }

    var imageData: Data? = nil
    let destinationData = NSMutableData()
    let options = [kCGImageDestinationLossyCompressionQuality: 0.9]

    guard let imageDestination = CGImageDestinationCreateWithData(destinationData, AVFileType.heic as CFString, imageReps.count, nil) else {
      return
    }

    for index in 0..<imageReps.count {
      if let imageRep = imageReps[index] as? NSBitmapImageRep {
        let nsImage = NSImage()
        nsImage.addRepresentation(imageRep)
        if let processedImage = hideNotchForEachImageOfHeic(image:nsImage, screen: screen) {
          if index == 0 {
            let imageMetaData = CGImageMetadataCreateMutable()
            let imageMetaDataTag = CGImageMetadataTagCreate("http://ns.apple.com/namespace/1.0/" as CFString,
                                                            "apple_desktop" as CFString,
                                                            metaDataTag.type as CFString,
                                                            CGImageMetadataType.string,
                                                            metaDataTag.plist as CFTypeRef)
            let success = CGImageMetadataSetTagWithPath(imageMetaData, nil, "xmp:\(metaDataTag.type)" as CFString, imageMetaDataTag!)
            if !success {
              return
            }

            CGImageDestinationAddImageAndMetadata(imageDestination, processedImage, imageMetaData, options as CFDictionary)
          } else {
            CGImageDestinationAddImage(imageDestination, processedImage, options as CFDictionary)
          }
        }
      }
    }

    CGImageDestinationFinalize(imageDestination)
    imageData = destinationData as Data
    let imageName = UUID().uuidString
    guard let url = saveHeicData(data:imageData, isProcessed: true, imageName: imageName) else {
      return
    }
    let _ = saveHeicData(image: image, isProcessed: false, imageName: imageName)
    setDesktopImageURL(url: url, screen: screen)
  }

  private func hideNotchForEachImageOfHeic(image:NSImage, screen: NSScreen) -> CGImage? {
    guard let finalCGImage = addBlackRect(on: image, screen: screen) else {
      return nil
    }
    return finalCGImage
  }



  private func hideSingleDesktopNotch(image:NSImage, screen: NSScreen) {

    let finalCGImage = addBlackRect(on: image, screen: screen)

    guard let finalCGImage = finalCGImage else {
      return
    }

    let imageName = UUID().uuidString
    guard let imageUrl = saveCGImage(finalCGImage, isProcessed: true, imageName: imageName) else {return}
    let _ = saveImage(image, isProcessed: false, imageName: imageName)
    setDesktopImageURL(url:imageUrl, screen: screen)
  }


  private func addBlackRect(on image:NSImage, screen: NSScreen) -> CGImage? {
    var screenSize:CGSize = .zero
    screenSize = screen.visibleFrame.size

    let nsscreenSize = NSSize(width: screenSize.width,
                              height: screenSize.height)

    guard let resizeWallpaperImage = image
      .resizeMaintainingAspectRatio(withSize: nsscreenSize) else {return nil}

    var imageRect = CGRect(origin: .zero,
                           size: CGSize(width: resizeWallpaperImage.width,
                                        height: resizeWallpaperImage.height))
    guard let cgwallpaper = resizeWallpaperImage
      .cgImage(forProposedRect: &imageRect, context: nil, hints: nil) else {
      return nil
    }

    guard let finalWallpaper = cgwallpaper.crop(toSize: screenSize) else {return nil}


    let barHeight = screen.frame.height - screen.visibleFrame.size.height
    var finalCGImage:CGImage? = nil

    if let context = createContext(size: screenSize) {
      context.draw(finalWallpaper, in: CGRect(origin: .zero, size: screenSize))
      context.setFillColor(.black)
      context.fill(CGRect(origin: CGPoint(x: 0, y: screenSize.height - barHeight), size: CGSize(width: screenSize.width, height: barHeight)))
      finalCGImage = context.makeImage()
    }
    return finalCGImage
  }

  private func setDesktopImageURL(url:URL, screen: NSScreen) {
    do {
      let workspace = NSWorkspace.shared
      try workspace.setDesktopImageURL(url, for: screen, options: [:])
    } catch {
      print("Could not set desktop image URL")
      return
    }
  }

  private func saveImage(_ image:NSImage, isProcessed:Bool, imageName:String) -> URL? {
    guard let destinationURL = saveDestination(isProcessed: isProcessed, imageName: imageName, type: "jpg") else {
      return nil
    }
    if image.jpgWrite(to: destinationURL, options: .withoutOverwriting) {
      print("destinationURL:\(destinationURL)")
      return destinationURL
    }
    return nil
  }

  private func saveCGImage(_ image: CGImage, isProcessed:Bool, imageName:String) -> URL? {
    guard let destinationURL = saveDestination(isProcessed: isProcessed, imageName: imageName, type: "jpg") else {
      return nil
    }
    let cfdestinationURL = destinationURL as CFURL
    let destination = CGImageDestinationCreateWithURL(cfdestinationURL,  UTType.jpeg.identifier as CFString as CFString, 1, nil)
    guard let destination = destination else {return nil}
    CGImageDestinationAddImage(destination, image, nil)
    if !CGImageDestinationFinalize(destination) {
      return nil
    }
    return destinationURL as URL
  }


  private func saveHeicData(image:NSImage, isProcessed:Bool, imageName:String) -> URL? {
    guard let destinationURL = saveDestination(isProcessed: isProcessed, imageName: imageName, type: "heic") else {
      return nil
    }
    if image.heicWrite(to: destinationURL, options: .withoutOverwriting) {
      print("destinationURL:\(destinationURL)")
      return destinationURL
    }
    return nil
  }

  private func saveHeicData(data:Data?, isProcessed:Bool, imageName:String) -> URL? {
    guard let destinationURL = saveDestination(isProcessed: isProcessed, imageName: imageName, type: "heic") else {
      return nil
    }
    do {
      try data?.write(to: destinationURL, options: .withoutOverwriting)
      print("destinationURL:\(destinationURL)")
      return destinationURL
    } catch {
      return nil
    }

  }

  private func saveDestination(isProcessed:Bool, imageName:String, type:String) -> URL? {

    guard let imagePath = myAppPath?.appendingPathComponent(isProcessed ? "processed" : "original") else {return nil}
    if !FileManager.default.fileExists(atPath: imagePath.path) {
      do {
        try FileManager.default.createDirectory(atPath: imagePath.path, withIntermediateDirectories: true, attributes: nil)
      } catch {
        return nil
      }
    }
    let destinationPath = imagePath.appendingPathComponent("\(imageName).\(type)")
    let destinationURL = URL(fileURLWithPath: destinationPath.path)
    return destinationURL
  }

  private func createContext(size: CGSize) -> CGContext? {
    return CGContext(data: nil,
                     width: Int(size.width),
                     height: Int(size.height),
                     bitsPerComponent: 8,
                     bytesPerRow: 0,
                     space: CGColorSpaceCreateDeviceRGB(),
                     bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)
  }
}

struct HeicMetaDataTag {
  let type:String // solor, h24, apr
  let plist:String //base64 Property List
}
