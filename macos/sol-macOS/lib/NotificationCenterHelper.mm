#import "NotificationCenterHelper.h"
#import "FMDatabase.h"
#include <iostream>

@implementation NotificationCenterHelper

+ (NSMutableArray *)getNotifications {
  NSString *pathToNCSupport = @"/private/var/folders/qn/vyvn49j90jv9_77vq77wzvw00000gn/0/com.apple.notificationcenter/db2";
  NSError *error = nil;
  NSArray *contents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:pathToNCSupport error:&error];
  NSMutableArray *array = [[NSMutableArray alloc] init];

  FMDatabase *database = nil;
  for (NSString *child in contents) {
    if([child isEqualToString:@"db"]) {
      database = [FMDatabase databaseWithPath:[pathToNCSupport stringByAppendingPathComponent:child]];
      if([database open]) {
        FMResultSet *rs = [database executeQuery:@"select data from record"];
        while ([rs next]) {
          NSData *data = [rs dataForColumn:@"data"];
          NSDictionary *temp = [NSPropertyListSerialization propertyListWithData:data options:NSPropertyListImmutable format:nil error:&error];
          [array addObject:temp];
        }

        [database close];
        break;
      }
    }
  }

  return array;
}

+ (void)clearNotifications {
  NSString *pathToNCSupport = @"/private/var/folders/qn/vyvn49j90jv9_77vq77wzvw00000gn/0/com.apple.notificationcenter/db2";
  NSArray *contents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:pathToNCSupport error:nil];

  FMDatabase *database = nil;
  for (NSString *child in contents) {
    if([child isEqualToString:@"db"]) {
      database = [FMDatabase databaseWithPath:[pathToNCSupport stringByAppendingPathComponent:child]];
      if([database open]) {
        [database executeUpdate:@"delete from record"];
        [database close];
        break;
      }
    }
  }
}

@end
