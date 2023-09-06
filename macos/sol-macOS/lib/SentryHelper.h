#ifndef SentryHelper_h
#define SentryHelper_h

#import <Foundation/Foundation.h>

@interface SentryHelper:NSObject
+ (void) addBreadcrumb:(NSString *) category message: (NSString *) message;
@end

#endif /* SentryHelper_h */
