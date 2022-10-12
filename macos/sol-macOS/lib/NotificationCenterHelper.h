#ifndef NotificationCenterHelper_h
#define NotificationCenterHelper_h

#import <Foundation/Foundation.h>

@interface NotificationCenterHelper : NSObject

+ (NSMutableArray*)getNotifications;
+ (void)clearNotifications;

@end

#endif
