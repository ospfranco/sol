#import "Spotify.h"
#import "SpotifyForwarder.h"
#import <CoreServices/CoreServices.h>
#import <ScriptingBridge/ScriptingBridge.h>

@implementation SpotifyForwarder

-(instancetype)init {
  eventPort = CGEventTapCreate( kCGSessionEventTap, kCGHeadInsertEventTap, kCGEventTapOptionDefault, CGEventMaskBit(NX_SYSDEFINED), tapEventCallback, (__bridge void * _Nullable)(self));
  if ( eventPort == NULL )
  {
    eventPort = CGEventTapCreate( kCGSessionEventTap, kCGHeadInsertEventTap, kCGEventTapOptionDefault, NX_SYSDEFINEDMASK, tapEventCallback, (__bridge void * _Nullable)(self));
  }
  
  if ( eventPort != NULL )
  {
    
    eventPortSource = CFMachPortCreateRunLoopSource( kCFAllocatorSystemDefault, eventPort, 0 );
    
    [self startEventSession];
    
  }
  else
  {
    NSAlert *alert = [[NSAlert alloc] init];
    [alert setMessageText:@"Error"];
    [alert setInformativeText:@"Cannot start spotify event listening. Please add Sol to the \"Security & Privacy\" pane in System Preferences. Check \"Accessibility\" and \"Automation\" under the \"Privacy\" tab."];
    [alert addButtonWithTitle:@"Ok"];
    [alert runModal];
  }
  
  return self;
}

static CGEventRef tapEventCallback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon)
{
  @autoreleasepool
  {
    SpotifyForwarder *self = (__bridge id)refcon;
    
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
    
    // iTunesApplication *iTunes = [SBApplication applicationWithBundleIdentifier:[self iTunesBundleIdentifier]];
    SpotifyApplication *spotify = [SBApplication applicationWithBundleIdentifier:@"com.spotify.client"];
    
    int keyFlags = ([nsEvent data1] & 0x0000FFFF);
    BOOL keyIsPressed = (((keyFlags & 0xFF00) >> 8)) == 0xA;
    
    if (keyIsPressed)
    {
      switch (keyCode)
      {
        case NX_KEYTYPE_PLAY:
        {
          [spotify playpause];
          break;
        }
        case NX_KEYTYPE_NEXT:
        case NX_KEYTYPE_FAST:
        {
          [spotify nextTrack];
          break;
        };
        case NX_KEYTYPE_PREVIOUS:
        case NX_KEYTYPE_REWIND:
        {
          [spotify previousTrack];
          break;
        }
      }
    }
    
    // stop propagation
    
    return NULL;
  }
}

- ( void ) startEventSession
{
  if (!CFRunLoopContainsSource(CFRunLoopGetCurrent(), eventPortSource, kCFRunLoopCommonModes)) {
    CFRunLoopAddSource( CFRunLoopGetCurrent(), eventPortSource, kCFRunLoopCommonModes );
    CFRunLoopRun();
  }
}

- ( void ) stopEventSession
{
  if (CFRunLoopContainsSource(CFRunLoopGetCurrent(), eventPortSource, kCFRunLoopCommonModes)) {
    CFRunLoopRemoveSource( CFRunLoopGetCurrent(), eventPortSource, kCFRunLoopCommonModes );
    CFRunLoopStop(CFRunLoopGetCurrent());
  }
}


@end





