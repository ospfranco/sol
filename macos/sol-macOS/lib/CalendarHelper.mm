#import "CalendarHelper.h"
#import <AppKit/AppKit.h>

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
  @try {
    NSArray *calendars = [_store calendarsForEntityType:EKEntityTypeEvent];

    if (!calendars || calendars.count == 0) {
      NSLog(@"No calendars available");
      return @[];
    }

    NSCalendar *gregorian = [[NSCalendar alloc]
        initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
    NSDateComponents *nextDays = [[NSDateComponents alloc] init];
    nextDays.day = 14;
    NSDate *nextDate = [gregorian dateByAddingComponents:nextDays
                                                  toDate:[NSDate date]
                                                 options:0];

    NSPredicate *predicate =
        [_store predicateForEventsWithStartDate:[NSDate date]
                                        endDate:nextDate
                                      calendars:calendars];
    NSArray<EKEvent *> *events = [_store eventsMatchingPredicate:predicate];
    return events ? events : @[];
  } @catch (NSException *exception) {
    NSLog(@"Error fetching events: %@", exception);
    return @[];
  }
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

- (void)focusDate:(NSString *)dateISO {
  @try {
    // Parse the ISO date string
    NSISO8601DateFormatter *formatter = [[NSISO8601DateFormatter alloc] init];
    formatter.formatOptions = NSISO8601DateFormatWithInternetDateTime | NSISO8601DateFormatWithFractionalSeconds;
    NSDate *date = [formatter dateFromString:dateISO];

    if (date == nil) {
      // Try without fractional seconds
      formatter.formatOptions = NSISO8601DateFormatWithInternetDateTime;
      date = [formatter dateFromString:dateISO];
    }

    if (date == nil) {
      NSLog(@"Could not parse date: %@", dateISO);
      return;
    }

    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDateComponents *components = [calendar components:(NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay)
                                               fromDate:date];

    // Use AppleScript to open Calendar and switch to the date
    NSString *script = [NSString stringWithFormat:
      @"tell application \"Calendar\"\n"
      @"  activate\n"
      @"  set targetDate to current date\n"
      @"  set year of targetDate to %ld\n"
      @"  set month of targetDate to %ld\n"
      @"  set day of targetDate to %ld\n"
      @"  switch view to day view\n"
      @"  view calendar at targetDate\n"
      @"end tell",
      (long)components.year, (long)components.month, (long)components.day];

    NSAppleScript *appleScript = [[NSAppleScript alloc] initWithSource:script];
    NSDictionary *errorInfo = nil;
    [appleScript executeAndReturnError:&errorInfo];

    if (errorInfo != nil) {
      NSLog(@"AppleScript error: %@", errorInfo);
    }
  } @catch (NSException *exception) {
    NSLog(@"Error focusing date: %@", exception);
  }
}

@end
