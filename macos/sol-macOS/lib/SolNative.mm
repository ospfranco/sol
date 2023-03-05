#import "JSIBindings.hpp"
#import "React/RCTEventEmitter.h"
#import <React/RCTBridge+Private.h>
#import <ReactCommon/RCTTurboModule.h>
#import <jsi/jsi.h>

@interface RCT_EXTERN_MODULE (SolNative, RCTEventEmitter)

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(install) {
  RCTBridge *bridge = [RCTBridge currentBridge];
  RCTCxxBridge *cxxBridge = (RCTCxxBridge *)bridge;
  if (cxxBridge == nil) {
    return @false;
  }

  auto jsiRuntime = (facebook::jsi::Runtime *)cxxBridge.runtime;
  if (jsiRuntime == nil) {
    return @false;
  }
  auto &runtime = *jsiRuntime;
  auto callInvoker = bridge.jsCallInvoker;

  sol::install(runtime, callInvoker);
  return @true;
}

RCT_EXTERN_METHOD(supportedEvents)
RCT_EXTERN_METHOD(getApps: (RCTPromiseResolveBlock)resolve
                  rejecter : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(openFile : (NSString)path)
RCT_EXTERN_METHOD(openWithFinder : (NSString)path)
RCT_EXTERN_METHOD(toggleDarkMode)
RCT_EXTERN_METHOD(executeAppleScript : (NSString)source)
RCT_EXTERN_METHOD(executeBashScript : (NSString)source
                  resolver: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getMediaInfo: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setGlobalShortcut : (NSString)key)
RCT_EXTERN_METHOD(setLaunchAtLogin : (BOOL)launchAtLogin)
RCT_EXTERN_METHOD(getAccessibilityStatus: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(requestAccessibilityAccess: (RCTPromiseResolveBlock)resolve
                  rejecter: (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(resizeFrontmostRightHalf)
RCT_EXTERN_METHOD(resizeFrontmostLeftHalf)
RCT_EXTERN_METHOD(resizeFrontmostTopHalf)
RCT_EXTERN_METHOD(resizeFrontmostBottomHalf)
RCT_EXTERN_METHOD(resizeFrontmostFullscreen)
RCT_EXTERN_METHOD(resizeTopLeft)
RCT_EXTERN_METHOD(resizeTopRight)
RCT_EXTERN_METHOD(resizeBottomLeft)
RCT_EXTERN_METHOD(resizeBottomRight)
RCT_EXTERN_METHOD(moveFrontmostNextScreen)
RCT_EXTERN_METHOD(moveFrontmostPrevScreen)
RCT_EXTERN_METHOD(insertToFrontmostApp : (NSString)content)
RCT_EXTERN_METHOD(pasteToFrontmostApp : (NSString)content)
RCT_EXTERN_METHOD(turnOnHorizontalArrowsListeners)
RCT_EXTERN_METHOD(turnOffHorizontalArrowsListeners)
RCT_EXTERN_METHOD(turnOffEnterListener)
RCT_EXTERN_METHOD(turnOnEnterListener)
RCT_EXTERN_METHOD(turnOnVerticalArrowsListeners)
RCT_EXTERN_METHOD(turnOffVerticalArrowsListeners)
RCT_EXTERN_METHOD(setScratchpadShortcut : (NSString)key)
RCT_EXTERN_METHOD(setClipboardManagerShortcut : (NSString)key)
RCT_EXTERN_METHOD(checkForUpdates)
RCT_EXTERN_METHOD(setWindowRelativeSize : (nonnull NSNumber)relative)
RCT_EXTERN_METHOD(openFinderAt : (NSString)path)
RCT_EXTERN_METHOD(setShowWindowOn : (NSString)on)
RCT_EXTERN_METHOD(setWindowManagement: (BOOL)v)
RCT_EXTERN_METHOD(useBackgroundOverlay: (BOOL)v)
RCT_EXTERN_METHOD(toggleDND)
RCT_EXTERN_METHOD(securelyStore: (NSString)key payload:(NSString)payload resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(securelyRetrieve: (NSString)key resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(showToast: (NSString)text)
RCT_EXTERN_METHOD(shouldHideMenubar: (BOOL)v)
RCT_EXTERN_METHOD(hasFullDiskAccess: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getSafariBookmarks: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(quit)
RCT_EXTERN_METHOD(setStatusBarItemTitle: (NSString)title)
RCT_EXTERN_METHOD(setSpotifyForwardingEnabled: (BOOL)v)
@end
