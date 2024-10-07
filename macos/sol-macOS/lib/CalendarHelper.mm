#import "CalendarHelper.h"

@implementation CalendarHelper

- (instancetype)init {
  self = [super init];
  if (self) {
    _store = [[EKEventStore alloc] init];
  }
  return self;
}

- (void)requestCalendarAccess:(void (^)(void))callback {
  if (@available(macOS 14.0, *)) {
    [_store requestFullAccessToEventsWithCompletion:^(
                BOOL granted, NSError *_Nullable error) {
      if (granted) {
        callback();
      } else {
        NSLog(@"Access not granted %@", error);
      }
    }];
  } else {
    [_store
        requestAccessToEntityType:EKEntityTypeEvent
                       completion:^(BOOL granted, NSError *_Nullable error) {
                         if (granted) {
                           callback();
                         } else {
                           NSLog(@"Access not granted %@", error);
                         }
                       }];
  }
}

- (NSArray<EKEvent *> *)getEvents {
  NSArray *calendars = [_store calendarsForEntityType:EKEntityTypeEvent];

  NSCalendar *gregorian = [[NSCalendar alloc]
      initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
  NSDateComponents *fiveDaysComponent = [[NSDateComponents alloc] init];
  fiveDaysComponent.day = 30;
  NSDate *nextDate = [gregorian dateByAddingComponents:fiveDaysComponent
                                                toDate:[NSDate date]
                                               options:0];

  NSPredicate *predicate = [_store predicateForEventsWithStartDate:[NSDate date]
                                                           endDate:nextDate
                                                         calendars:calendars];
  NSArray<EKEvent *> *events = [_store eventsMatchingPredicate:predicate];
  return events;
}

- (NSString *)getCalendarAuthorizationStatus {
  EKAuthorizationStatus status =
      [EKEventStore authorizationStatusForEntityType:EKEntityTypeEvent];
  switch (status) {
  case EKAuthorizationStatusDenied:
    return @"denied";

  case EKAuthorizationStatusAuthorized:
    return @"authorized";

  case EKAuthorizationStatusRestricted:
    return @"restricted";

  case EKAuthorizationStatusNotDetermined:
  default:
    return @"notDetermined";
  }
}

@end
