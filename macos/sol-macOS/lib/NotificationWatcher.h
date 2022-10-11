//
//  NotificationWatcher.h
//  sol
//
//  Created by Oscar on 10.10.22.
//

#ifndef NotificationWatcher_h
#define NotificationWatcher_h

#import <Foundation/Foundation.h>

@interface NotificationWatcher : NSObject

/**
 returns the number of notifications that are currently presented in the NC (of any app -- in the visible sidebar)
 NOTE: Supports KVO
 NOTE: Only works while started
 **/
//@property(nonatomic, readonly) NSUInteger numberOfPresentedNotifications;
//
//- (BOOL)start:(NSError**)pError;
//- (void)stop;

- (NSMutableArray*)getNotifications;

@end

#endif /* NotificationWatcher_h */
