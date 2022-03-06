import Foundation
import MediaPlayer

struct MediaHelper {
  static func getCurrentMedia(callback: @escaping ([String: Any]) -> Void) {
    // Load framework
    let bundle = CFBundleCreate(kCFAllocatorDefault, NSURL(fileURLWithPath: "/System/Library/PrivateFrameworks/MediaRemote.framework"))

    // Get a Swift function for MRMediaRemoteGetNowPlayingInfo
    guard let MRMediaRemoteGetNowPlayingInfoPointer = CFBundleGetFunctionPointerForName(bundle, "MRMediaRemoteGetNowPlayingInfo" as CFString) else { return }
    typealias MRMediaRemoteGetNowPlayingInfoFunction = @convention(c) (DispatchQueue, @escaping ([String: Any]) -> Void) -> Void
    let MRMediaRemoteGetNowPlayingInfo = unsafeBitCast(MRMediaRemoteGetNowPlayingInfoPointer, to: MRMediaRemoteGetNowPlayingInfoFunction.self)

    // Get a Swift function for MRNowPlayingClientGetBundleIdentifier
    guard let MRNowPlayingClientGetBundleIdentifierPointer = CFBundleGetFunctionPointerForName(bundle, "MRNowPlayingClientGetBundleIdentifier" as CFString) else { return }
    typealias MRNowPlayingClientGetBundleIdentifierFunction = @convention(c) (AnyObject?) -> String
    let MRNowPlayingClientGetBundleIdentifier = unsafeBitCast(MRNowPlayingClientGetBundleIdentifierPointer, to: MRNowPlayingClientGetBundleIdentifierFunction.self)

    // Get song info
    MRMediaRemoteGetNowPlayingInfo(DispatchQueue.main, callback
//                                   {
      
//      (information) in
      
//        NSLog("%@", information["kMRMediaRemoteNowPlayingInfoArtist"] as! String)
//        NSLog("%@", information["kMRMediaRemoteNowPlayingInfoTitle"] as! String)
//        NSLog("%@", information["kMRMediaRemoteNowPlayingInfoAlbum"] as! String)
//        NSLog("%@", information["kMRMediaRemoteNowPlayingInfoDuration"] as! String)
//        let artwork = NSImage(data: information["kMRMediaRemoteNowPlayingInfoArtworkData"] as! Data)
//
//        // Get bundle identifier
//        let _MRNowPlayingClientProtobuf: AnyClass? = NSClassFromString("_MRNowPlayingClientProtobuf")
//        let handle : UnsafeMutableRawPointer! = dlopen("/usr/lib/libobjc.A.dylib", RTLD_NOW)
//        let object = unsafeBitCast(dlsym(handle, "objc_msgSend"), to:(@convention(c)(AnyClass?,Selector?)->AnyObject).self)(_MRNowPlayingClientProtobuf,Selector("a"+"lloc"))
//        unsafeBitCast(dlsym(handle, "objc_msgSend"), to:(@convention(c)(AnyObject?,Selector?,Any?)->Void).self)(object,Selector("i"+"nitWithData:"),information["kMRMediaRemoteNowPlayingInfoClientPropertiesData"] as AnyObject?)
//        NSLog("%@", MRNowPlayingClientGetBundleIdentifier(object))
//        dlclose(handle)
//    }
    )
  }
}
