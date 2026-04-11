#import "CalendarHelper.h"
#import "MediaKeyForwarder.h"
#import "NSString+Score.h"
#import <AppKit/AppKit.h>
#import <RCTAppDelegate.h>
#import <React/RCTBridge.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTRootView.h>
#import <React/RCTUtils.h>
#import <React/RCTViewManager.h>

// File search indexing - Swift classes
@class FileSearchIndexObjC;
@class FileSearchIndexer;

AXError _AXUIElementGetWindow(AXUIElementRef element, uint32_t *identifier);
