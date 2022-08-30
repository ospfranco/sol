#import <Foundation/Foundation.h>
#import "CalendarHelper.h"
#import <EventKit/EKEventStore.h>

@implementation CalendarHelper

-(id)init {
  _store = [[EKEventStore alloc] init];
  return self;
}

-(void)requestCalendarAccess:(void(^)(void))callback {
  [_store requestAccessToEntityType:EKEntityTypeEvent completion:^(BOOL granted, NSError * _Nullable error) {
    if(granted) {
      NSLog(@"user has granted permission");
      callback();
    }
  }];
}

-(NSArray<EKEvent *> *)getEvents {
  NSArray *calendars = [_store calendarsForEntityType:EKEntityTypeEvent];
  NSCalendar *gregorian = [[NSCalendar alloc] initWithCalendarIdentifier:NSCalendarIdentifierGregorian];

  NSDateComponents *fiveDaysComponent = [[NSDateComponents alloc] init];
  fiveDaysComponent.day = 5;
  NSDate *nextMonth = [gregorian dateByAddingComponents:fiveDaysComponent toDate:[NSDate date] options:0];

  NSPredicate *predicate = [_store predicateForEventsWithStartDate:[NSDate date] endDate:nextMonth calendars:calendars];
  return [_store eventsMatchingPredicate:predicate];
}

-(NSString *)getCalendarAuthorizationStatus {
  EKAuthorizationStatus status = [EKEventStore authorizationStatusForEntityType:EKEntityTypeEvent];
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
