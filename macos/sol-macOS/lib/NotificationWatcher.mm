#import "NotificationWatcher.h"
#import "FMDatabase.h"

@implementation NotificationWatcher {
//  SCEvents *_watcher;
//  FMDatabase *_database;
//  int _lastCountOfNotificationsInNC;
}

- (void)getNotifications {
  NSLog(@"test");
  NSString *pathToNCSupport = [@"~/Library/Application Support/NotificationCenter/" stringByExpandingTildeInPath];
  NSError *error = nil;
  NSArray *contents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:pathToNCSupport error:&error];    //find the db

  FMDatabase *database = nil;
  for (NSString *child in contents) {
    if([child.pathExtension isEqualToString:@"db"]) {
      database = [FMDatabase databaseWithPath:[pathToNCSupport stringByAppendingPathComponent:child]];
      if([database open]) {
        FMResultSet *rs = [database executeQuery:@"select count(*) as cnt from presented_notifications"];
        while ([rs next]) {
          int cnt = [rs intForColumn:@"cnt"];
          NSLog(@"Total Records :%d", cnt);
        }

        [database close];
        break;
      }
    }
  }
}

//- (BOOL)start:(NSError**)pError {
//  //get the directory contents
//  NSString *pathToNCSupport = [@"~/Library/Application Support/NotificationCenter/" stringByExpandingTildeInPath];
//  NSError *error = nil;
//  NSArray *contents = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:pathToNCSupport error:&error];
//
//  //error out
//  if(!contents) {
//    NSRunAlertPanel(@"Error", @"DiscoNotifier cant find the notification center support directory.\n\nWill Quit", @"OK", nil, nil);
//    [NSApp terminate:nil];
//  }
//
//  //find the db
//  FMDatabase *database = nil;
//  for (NSString *child in contents) {
//    if([child.pathExtension isEqualToString:@"db"]) {
//      database = [FMDatabase databaseWithPath:[pathToNCSupport stringByAppendingPathComponent:child]];
//      if([database open]) {
//        [database close];
//        break;
//      }
//    }
//  }
//
//  //error out
//  if(!database) {
//    NSRunAlertPanel(@"Error", @"DiscoNotifier cant find the notification center database.\n\nWill Quit", @"OK", nil, nil);
//    [NSApp terminate:nil];
//  }
//
//  //get initial count of notifications
//  _numberOfPresentedNotifications = [self countOfNotificationsInNC:database];
//
//  //error out
//  if(_lastCountOfNotificationsInNC<0) {
//    NSRunAlertPanel(@"Error", @"DiscoNotifier cant get the count of presented notifications.\n\nWill Quit", @"OK", nil, nil);
//    [NSApp terminate:nil];
//  }
//
//  //observe by monitoring FS changes
//  SCEvents *watcher = [[SCEvents alloc] init];
//  watcher.delegate = self;
//  BOOL up = [watcher startWatchingPaths:@[pathToNCSupport]];
//
//  //error out
//  if(!up) {
//    NSRunAlertPanel(@"Error", @"DiscoNotifier cant set FSEvents monitor for database file.\n\nWill Quit", @"OK", nil, nil);
//    [NSApp terminate:nil];
//  }
//
//  //save pointers
//  _watcher = watcher;
//  _database = database;
//
//  return YES;
//}
//
//- (void)stop {
//  [_watcher stopWatchingPaths];
//
//  _watcher = nil;
//  _database = nil;
//}
//
//- (void)dealloc {
//  [self stop];
//}
//
//#pragma mark -

//- (int)countOfNotificationsInNC:(FMDatabase*)db {
//  if([db open]) {
//    FMResultSet *rs = [db executeQuery:@"select count(*) as cnt from presented_notifications"];
//    while ([rs next]) {
//      int cnt = [rs intForColumn:@"cnt"];
//      NSLog(@"Total Records :%d", cnt);
//      return cnt;
//    }
//
//    [db close];
//  }
//
//  return -1;
//}
//
//- (void)pathWatcher:(SCEvents *)pathWatcher eventOccurred:(SCEvent *)event {
//  //check db for change
//  int newCount = [self countOfNotificationsInNC:_database];
//  if(newCount != _lastCountOfNotificationsInNC) {
//    //NC changed
//    [self willChangeValueForKey:@"numberOfPresentedNotifications"];
//    _numberOfPresentedNotifications = newCount;
//    [self didChangeValueForKey:@"numberOfPresentedNotifications"];
//  }
//}

@end
