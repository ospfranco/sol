#import "WindowManagerObjc.h"
#import "CSGSpace.h"

//@implementation WindowManagerObjc
//
//@end

void initWindowManagerObjc() {
  CGSConnectionID connectionId = CGSMainConnectionID();
  CFArrayRef allSpacesRef = CGSCopySpaces(connectionId, kCGSAllSpacesMask);
  if (!allSpacesRef) {
    return;
  }

  NSArray *allSpaces = (__bridge NSArray *)allSpacesRef;
  NSLog(@"allSpaces %@", allSpaces);

  uint64_t currentSpaceId = CGSGetActiveSpace(connectionId);
  NSLog(@"CurrentSpaceId %llu", currentSpaceId);

  NSInteger currentIndex = [allSpaces indexOfObject:@(currentSpaceId)];
  if (currentIndex == NSNotFound) {
    currentIndex = -1;
  }
  NSLog(@"Current index: %ld", (long)currentIndex);

  NSInteger nextIndex = (currentIndex + 1) % allSpaces.count;
  NSLog(@"Next Index %ld", (long)nextIndex);

  NSNumber *nextSpace = allSpaces[nextIndex];

  NSLog(@"ConnectionId %p", connectionId);
  
  CFStringRef currentDisplay = CGSCopyManagedDisplayForSpace(connectionId, currentSpaceId);

[NSThread sleepForTimeInterval:1.0]; 
    CGSManagedDisplaySetCurrentSpace(
      connectionId,
//      kCGSPackagesMainDisplayIdentifier,
                                     currentDisplay,
      nextSpace.unsignedLongLongValue
    );

  CFRelease(allSpacesRef);
}
