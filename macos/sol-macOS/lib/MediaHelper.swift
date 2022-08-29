import Foundation
import MediaPlayer

struct MediaHelper {
  // This is an internal framework and it's bound to break itself as macOS updates...
  static func getCurrentMedia(callback: @escaping ([String: Any?]) -> Void) {
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

      callback([
        "kMRMediaRemoteNowPlayingInfoArtist": information["kMRMediaRemoteNowPlayingInfoArtist"],
        "kMRMediaRemoteNowPlayingInfoTitle": information["kMRMediaRemoteNowPlayingInfoTitle"],
        "kMRMediaRemoteNowPlayingInfoArtworkData": information["kMRMediaRemoteNowPlayingInfoArtworkData"],
        "bundleIdentifier": bundleIdentifier
      ])

    })
  }
}
