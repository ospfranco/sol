#ifndef CalendarHelper_h
#define CalendarHelper_h

#import <EventKit/EventKit.h>

@interface CalendarHelper : NSObject

@property(nonatomic, strong) EKEventStore *store;

- (void)requestCalendarAccess:(void (^)(void))callback;
- (NSString *)getCalendarAuthorizationStatus;
- (NSArray<EKEvent *> *)getEvents;
- (NSArray<EKEvent *> *)getEventsForCalendarIdentifiers:
	(NSArray<NSString *> *_Nullable)calendarIdentifiers;
- (NSArray<NSDictionary<NSString *, NSString *> *> *)getCalendars;
- (void)focusDate:(NSString *)dateISO;

@end
#endif /* CalendarHelper_h */
