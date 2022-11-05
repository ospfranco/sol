#import "NotificationCenterHelper.h"
#import "FMDatabase.h"
#include <iostream>

@implementation NotificationCenterHelper

+ (NSString *)runCommand:(NSString *)commandToRun
{
  NSTask *task = [[NSTask alloc] init];
  [task setLaunchPath:@"/bin/sh"];

  NSArray *arguments = [NSArray arrayWithObjects:
                        @"-c" ,
                        [NSString stringWithFormat:@"%@", commandToRun],
                        nil];
//  NSLog(@"run command:%@", commandToRun);
  [task setArguments:arguments];

  NSPipe *pipe = [NSPipe pipe];
  [task setStandardOutput:pipe];

  NSFileHandle *file = [pipe fileHandleForReading];

  [task launch];

  NSData *data = [file readDataToEndOfFile];

  NSString *output = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  return output;
}

+ (NSMutableArray *)getNotifications {
  NSString *rawPath = [NotificationCenterHelper runCommand:@"lsof -p $(ps aux | grep -m1 usernoted | awk '{ print $2 }')| awk '{ print $NF }' | grep 'db2/db$' | xargs dirname"];
  NSMutableArray *array = [[NSMutableArray alloc] init];

  if(rawPath != nil) {
    NSString *path = [rawPath componentsSeparatedByString:@"\n"][0];
    NSError *error = nil;
    NSArray *contents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:path error:&error];
    FMDatabase *database = nil;
    for (NSString *child in contents) {
      if([child isEqualToString:@"db"]) {
        database = [FMDatabase databaseWithPath:[path stringByAppendingPathComponent:child]];
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
  }

  return array;
}

+ (void)clearNotifications {
  NSString *rawPath = [NotificationCenterHelper runCommand:@"lsof -p $(ps aux | grep -m1 usernoted | awk '{ print $2 }')| awk '{ print $NF }' | grep 'db2/db$' | xargs dirname"];
  NSString *path = [rawPath componentsSeparatedByString:@"\n"][0];
  NSArray *contents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:path error:nil];

  FMDatabase *database = nil;
  for (NSString *child in contents) {
    if([child isEqualToString:@"db"]) {
      database = [FMDatabase databaseWithPath:[path stringByAppendingPathComponent:child]];
      if([database open]) {
        [database executeUpdate:@"delete from record"];
        [database close];
        break;
      }
    }
  }
}

@end
