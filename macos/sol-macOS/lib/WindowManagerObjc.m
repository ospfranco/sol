#import "WindowManagerObjc.h"
#import "CGSSpace.h"

static NSString *const CGSScreenIDKey = @"Display Identifier";
static NSString *const CGSSpaceIDKey = @"ManagedSpaceID";
static NSString *const CGSSpacesKey = @"Spaces";


void initWindowManagerObjc() {
  CGSConnectionID connectionId = CGSMainConnectionID();
  CFArrayRef allSpacesRef = CGSCopySpaces(connectionId, kCGSAllSpacesMask);
  if (!allSpacesRef) {
    return;
  }

//  NSArray *allSpaces = (__bridge NSArray *)allSpacesRef;
  NSMutableArray *allSpaces = [NSMutableArray array];
  NSArray *displaySpacesInfo = CFBridgingRelease(CGSCopyManagedDisplaySpaces(CGSMainConnectionID()));
  
  for (NSDictionary<NSString *, id> *spacesInfo in displaySpacesInfo) {
    NSArray<NSNumber *> *identifiers = [spacesInfo[CGSSpacesKey] valueForKey:CGSSpaceIDKey];
    
    for (NSNumber *identifier in identifiers) {
      [allSpaces addObject: [NSNumber numberWithUnsignedLongLong: identifier.unsignedLongValue]];
    }
  }
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
  
  NSLog(@"Current display %@", currentDisplay);
//  NSArray *destinationSpace = @[ @(nextSpace.unsignedLongLongValue) ];
//  CGSShowSpaces(connectionId, (__bridge CFArrayRef)destinationSpace);
//  NSArray *sourceSpace = @[ @(currentSpaceId)];
//  CGSHideSpaces(connectionId, (__bridge CFArrayRef) sourceSpace);

//  CGSManagedDisplaySetIsAnimating(connectionId, currentDisplay, true);
    CGSManagedDisplaySetCurrentSpace(
      connectionId,
//      kCGSPackagesMainDisplayIdentifier,
                                     currentDisplay,
      nextSpace.unsignedLongLongValue
    );
//  CGSManagedDisplaySetIsAnimating(connectionId, currentDisplay, false);

  CFRelease(allSpacesRef);
}
