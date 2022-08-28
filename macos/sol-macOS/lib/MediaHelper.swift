import Foundation
import MediaPlayer


@objc class MediaHelper: NSObject {
  // This is an internal framework and it's bound to break itself as macOS updates...
  @objc static func getCurrentMedia(_ callback: @escaping (Dictionary<String, String>) -> Void) {
    // Load MediaRemote framework
    let bundle = CFBundleCreate(
      kCFAllocatorDefault,
      NSURL(fileURLWithPath: "/System/Library/PrivateFrameworks/MediaRemote.framework")
    )

    // Get a Swift function for MRMediaRemoteGetNowPlayingInfo
    guard let MRMediaRemoteGetNowPlayingInfoPointer =
            CFBundleGetFunctionPointerForName(
              bundle,
              "MRMediaRemoteGetNowPlayingInfo" as CFString
            ) else { return }

    typealias MRMediaRemoteGetNowPlayingInfoFunction =
      @convention(c) (DispatchQueue, @escaping ([String: Any]) -> Void) -> Void
    let MRMediaRemoteGetNowPlayingInfo =
      unsafeBitCast(MRMediaRemoteGetNowPlayingInfoPointer, to: MRMediaRemoteGetNowPlayingInfoFunction.self)

    // Get a Swift function for MRNowPlayingClientGetBundleIdentifier
    guard let MRNowPlayingClientGetBundleIdentifierPointer =
          CFBundleGetFunctionPointerForName(
              bundle,
              "MRNowPlayingClientGetBundleIdentifier" as CFString) else { return }
    typealias MRNowPlayingClientGetBundleIdentifierFunction = @convention(c) (AnyObject?) -> String
    let MRNowPlayingClientGetBundleIdentifier =
          unsafeBitCast(
            MRNowPlayingClientGetBundleIdentifierPointer,
            to: MRNowPlayingClientGetBundleIdentifierFunction.self)

    // Get song info
    MRMediaRemoteGetNowPlayingInfo(DispatchQueue.main, {
      (information) in

      var bundleIdentifier: String?

      let _MRNowPlayingClientProtobuf: AnyClass? = NSClassFromString("MRClient")
      let handle : UnsafeMutableRawPointer! = dlopen("/usr/lib/libobjc.A.dylib", RTLD_NOW)
      let object = unsafeBitCast(dlsym(handle, "objc_msgSend"), to:(@convention(c)(AnyClass?,Selector?)->AnyObject).self)(_MRNowPlayingClientProtobuf,Selector("a"+"lloc"))
      unsafeBitCast(dlsym(handle, "objc_msgSend"), to:(@convention(c)(AnyObject?,Selector?,Any?)->Void).self)(object,Selector("i"+"nitWithData:"),information["kMRMediaRemoteNowPlayingInfoClientPropertiesData"] as AnyObject?)
      bundleIdentifier = MRNowPlayingClientGetBundleIdentifier(object)
      dlclose(handle)

      var base64 = ""
      let imageData = information["kMRMediaRemoteNowPlayingInfoArtworkData"] as? Data
      if(imageData != nil) {
        let bitmap = NSBitmapImageRep(data: imageData!)
        let data = bitmap?.representation(using: .jpeg, properties: [:])
        base64 = data != nil ? "data:image/jpeg;base64," + data!.base64EncodedString() : ""
      }

      let pathUrl = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleIdentifier!)?.path ?? ""

      callback([
        "artist": information["kMRMediaRemoteNowPlayingInfoArtist"] as! String,
        "title": information["kMRMediaRemoteNowPlayingInfoTitle"] as! String,
        "artwork": base64,
        "bundleIdentifier": bundleIdentifier ?? "",
        "url": pathUrl
      ])

    })
  }
}
