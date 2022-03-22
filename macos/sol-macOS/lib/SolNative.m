#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(SolNative, RCTEventEmitter)
RCT_EXTERN_METHOD(supportedEvents)
RCT_EXTERN_METHOD(getNextEvents: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(hideWindow)
RCT_EXTERN_METHOD(getApps: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(openFile: (NSString)path)
RCT_EXTERN_METHOD(openWithFinder: (NSString)path)
RCT_EXTERN_METHOD(toggleDarkMode)
RCT_EXTERN_METHOD(executeAppleScript: (NSString)source)
RCT_EXTERN_METHOD(getMediaInfo: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setGlobalShortcut: (NSString)key)
RCT_EXTERN_METHOD(getCalendarAuthorizationStatus: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
@end
