#import "SpotifyApplication.h"
#import "ITunesApplicationApplication.h"
#import "MediaKeyForwarder.h"
#import <CoreServices/CoreServices.h>
#import <ScriptingBridge/ScriptingBridge.h>
#import <React/RCTLog.h>

@implementation MediaKeyForwarder

-(instancetype)init {
  eventPort = CGEventTapCreate( kCGSessionEventTap, kCGHeadInsertEventTap, kCGEventTapOptionDefault, CGEventMaskBit(NX_SYSDEFINED), tapEventCallback, (__bridge void * _Nullable)(self));
  
  if ( eventPort == NULL ) {
    eventPort = CGEventTapCreate( kCGSessionEventTap, kCGHeadInsertEventTap, kCGEventTapOptionDefault, NX_SYSDEFINEDMASK, tapEventCallback, (__bridge void * _Nullable)(self));
  }
  
  if ( eventPort != NULL ) {
    eventPortSource = CFMachPortCreateRunLoopSource( kCFAllocatorSystemDefault, eventPort, 0 );
    
    [self startEventSession];
  }
  
  return self;
}

static CGEventRef tapEventCallback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon)
{
  @autoreleasepool
  {
    MediaKeyForwarder *self = (__bridge id)refcon;
    
    if(type == kCGEventTapDisabledByTimeout)
    {
      CGEventTapEnable(self->eventPort, TRUE);
      return event;
    }
    
    if(type == kCGEventTapDisabledByUserInput)
    {
      return event;
    }
    
    if(type != NX_SYSDEFINED )
    {
      return event;
    }
    
    NSEvent *nsEvent = nil;
    @try
    {
      nsEvent = [NSEvent eventWithCGEvent:event];
    }
    @catch (NSException * e)
    {
      return event;
    }
    
    if([nsEvent subtype] != 8)
    {
      return event;
    }
    
    int keyCode = (([nsEvent data1] & 0xFFFF0000) >> 16);
    
    if (keyCode != NX_KEYTYPE_PLAY &&
        keyCode != NX_KEYTYPE_FAST &&
        keyCode != NX_KEYTYPE_REWIND &&
        keyCode != NX_KEYTYPE_PREVIOUS &&
        keyCode != NX_KEYTYPE_NEXT)
    {
      return event;
    }
    
    iTunesApplication *iTunes = [SBApplication applicationWithBundleIdentifier:[self iTunesBundleIdentifier]];
    SpotifyApplication *spotify = [SBApplication applicationWithBundleIdentifier:@"com.spotify.client"];
    BOOL isITunesRunning = [self isITunesRunning];
    BOOL isSpotifyRunning = [self isSpotifyRunning];
    
    int keyFlags = ([nsEvent data1] & 0x0000FFFF);
    BOOL keyIsPressed = (((keyFlags & 0xFF00) >> 8)) == 0xA;
    
    if (!keyIsPressed)
    {
      switch (keyCode)
      {
        case NX_KEYTYPE_PLAY:
        {
          
          if(isITunesRunning) {
            [iTunes playpause];
          }
          
          if(isSpotifyRunning) {
            [spotify playpause];
          }
          
          break;
        }
        case NX_KEYTYPE_NEXT:
        case NX_KEYTYPE_FAST:
        {
          if(isITunesRunning) {
            [iTunes nextTrack];
          }
          
          if(isSpotifyRunning) {
            [spotify nextTrack];
          }
          
          break;
        };
        case NX_KEYTYPE_PREVIOUS:
        case NX_KEYTYPE_REWIND:
        {
          if(isITunesRunning) {
            [iTunes backTrack];
          }
          
          if(isSpotifyRunning) {
            [spotify previousTrack];
          }
          
          break;
        }
      }
    }
    
    // stop propagation
    return NULL;
  }
}

- (BOOL)isITunesRunning {
  NSArray *apps = [[NSWorkspace sharedWorkspace] runningApplications];
  NSString *musicBundleIdentifier = [self iTunesBundleIdentifier];
  for(NSRunningApplication *app in apps) {
    if([app.bundleIdentifier isEqual: musicBundleIdentifier]) {
      return YES;
    }
  }
  return NO;
}

- (BOOL)isSpotifyRunning {
  NSArray *apps = [[NSWorkspace sharedWorkspace] runningApplications];
  for(NSRunningApplication *app in apps) {
    if([app.bundleIdentifier isEqual: @"com.spotify.client"]) {
      return YES;
    }
  }
  return NO;
}

- (NSString *)iTunesBundleIdentifier {
    if ( @available(macOS 10.15, *) )
    {
        return @"com.apple.Music";
    }
    else
    {
        return @"com.apple.iTunes";
    }
}

- ( void ) startEventSession
{
  if (eventPortSource != NULL && !CFRunLoopContainsSource(CFRunLoopGetCurrent(), eventPortSource, kCFRunLoopCommonModes)) {
    CFRunLoopAddSource( CFRunLoopGetCurrent(), eventPortSource, kCFRunLoopCommonModes );
    // CFRunLoopRun();
  }
}

- ( void ) stopEventSession
{
  if (eventPortSource != NULL && CFRunLoopContainsSource(CFRunLoopGetCurrent(), eventPortSource, kCFRunLoopCommonModes)) {
    CFRunLoopRemoveSource( CFRunLoopGetCurrent(), eventPortSource, kCFRunLoopCommonModes );
    // CFRunLoopStop(CFRunLoopGetCurrent());
  }
}


@end





