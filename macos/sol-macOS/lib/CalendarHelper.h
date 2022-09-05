#ifndef CalendarHelper_h
#define CalendarHelper_h

#import <EventKit/EKEventStore.h>

@interface CalendarHelper:NSObject

- (void)requestCalendarAccess:(void(^)(void))callback;
- (NSString *)getCalendarAuthorizationStatus;
- (NSArray<EKEvent *> *)getEvents;

@end
#endif /* CalendarHelper_h */
