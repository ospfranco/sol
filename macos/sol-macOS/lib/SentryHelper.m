#import "SentryHelper.h"
#import "Sentry.h"

@implementation SentryHelper

+ (void) addBreadcrumb:(NSString *) category message: (NSString *) message {
  SentryBreadcrumb *crumb = [[SentryBreadcrumb alloc] init];
  crumb.level = kSentryLevelInfo;
  crumb.category = category;
  crumb.message = message;
  [SentrySDK addBreadcrumb:crumb];
}

@end
