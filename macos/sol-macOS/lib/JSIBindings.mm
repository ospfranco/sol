#include "JSIBindings.hpp"
#import "CalendarHelper.h"
#import "FileSearch.h"
#import "JSIUtils.h"
#include "SolMacros.h"
#import "processes.h"
#import <Cocoa/Cocoa.h>
#import <EventKit/EKCalendar.h>
#import <EventKit/EKEvent.h>
#import <EventKit/EKParticipant.h>
#import <Foundation/Foundation.h>
#import <iostream>
#ifdef DEBUG
#import <sol_debug-Swift.h>
#else
#import <sol-Swift.h>
#endif
#import "FolderWatcherJSI.h"

extern "C" {
#import <CoreLocation/CoreLocation.h>
#import <CoreWLAN/CoreWLAN.h>
#import <ifaddrs.h>
}

namespace sol {

namespace jsi = facebook::jsi;
namespace react = facebook::react;

std::shared_ptr<react::CallInvoker> invoker;
CalendarHelper *calendarHelper;

NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];

void install(jsi::Runtime &rt,
             std::shared_ptr<react::CallInvoker> callInvoker) {
  invoker = callInvoker;
  calendarHelper = [[CalendarHelper alloc] init];
  dateFormatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ssZ";

  auto setHeight = HOSTFN("setHeight", []) {
    int height = static_cast<int>(arguments[0].asNumber());
    dispatch_async(dispatch_get_main_queue(), ^{
      PanelManager *panelManager = [PanelManager shared];
      [panelManager setHeight:height];
    });

    return {};
  });

  auto resetWindowSize = HOSTFN("resetWindowSize", []) {
    dispatch_async(dispatch_get_main_queue(), ^{
      PanelManager *panelManager = [PanelManager shared];
      [panelManager resetSize];
    });

    return {};
  });

  auto hideWindow = HOSTFN("hideWindow", []) {
    dispatch_async(dispatch_get_main_queue(), ^{
      PanelManager *panelManager = [PanelManager shared];
      [panelManager hideWindow];
    });

    return {};
  });

  auto showWindow = HOSTFN("showWindow", []) {
    dispatch_async(dispatch_get_main_queue(), ^{
      PanelManager *panelManager = [PanelManager shared];
      [panelManager showWindowWithTarget:NULL];
    });

    return {};
  });

  auto getWifiPassword = HOSTFN("getWifiPassword", []) {

    CLLocationManager *lm = [[CLLocationManager alloc] init];
    bool location_enabled = [lm locationServicesEnabled];

    if (!location_enabled) {
      throw std::runtime_error("Location services are not enabled");
    }

    CLAuthorizationStatus authorization_status = [lm authorizationStatus];

    if (authorization_status == kCLAuthorizationStatusDenied) {
      throw std::runtime_error("App doesn't have location access");
    }

    [lm requestAlwaysAuthorization];

    CWWiFiClient *sharedClient = [CWWiFiClient sharedWiFiClient];
    CWInterface *interface = [sharedClient interface];
    NSString *ssid = [interface ssid];
    if (!ssid) {
      throw std::runtime_error("Could not get connected network info");
    }
    NSString *psk = nil;

    OSStatus status = CWKeychainFindWiFiPassword(
        kCWKeychainDomainSystem, [ssid dataUsingEncoding:NSUTF8StringEncoding],
        &psk);
    if (status != errSecSuccess) {
      throw std::runtime_error("OS error code: " + std::to_string(status));
    }

    auto jsi_password = sol::NSStringToJsiValue(rt, psk);
    auto jsi_ssid = sol::NSStringToJsiValue(rt, ssid);
    auto res = jsi::Object(rt);
    res.setProperty(rt, "password", jsi_password);
    res.setProperty(rt, "ssid", jsi_ssid);

    return res;
  });

  auto getWifiInfo = HOSTFN("getWifiInfo", []) {
    if (@available(macOS 15.0, *)) {
      CLLocationManager *locationManager = [[CLLocationManager alloc] init];
      [locationManager requestAlwaysAuthorization];
    }

    //    CWWiFiClient *sharedClient = [CWWiFiClient sharedWiFiClient];
    //    CWInterface *interface = [sharedClient interface];
    //    NSString *ssid = interface.ssid;

    struct ifaddrs *interfaces = NULL;
    struct ifaddrs *temp_addr = NULL;
    int success = 0;
    getifaddrs(&interfaces);
    NSString *address = @"error";

    if (success == 0) {
      // Loop through linked list of interfaces
      temp_addr = interfaces;
      while (temp_addr != NULL) {
        if (temp_addr->ifa_addr->sa_family == AF_INET) {
          // Check if interface is en0 which is the wifi connection on the
          // iPhone
          if ([[NSString stringWithUTF8String:temp_addr->ifa_name]
                  isEqualToString:@"en0"]) {
            // Get NSString from C String
            address = [NSString
                stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)
                                                    temp_addr->ifa_addr)
                                                   ->sin_addr)];
          }
        }
        temp_addr = temp_addr->ifa_next;
      }
    }
    auto res = jsi::Object(rt);
    if (address) {
      res.setProperty(rt, "ip", NSStringToJsiValue(rt, address));
    }
    return res;
  });

  auto searchFiles = HOSTFN("searchFiles", []) {
    auto paths = arguments[0].asObject(rt).asArray(rt);
    auto query = arguments[1].asString(rt).utf8(rt);
    std::vector<File> res;
    for (size_t i = 0; i < paths.size(rt); i++) {
      auto path = paths.getValueAtIndex(rt, i).asString(rt).utf8(rt);
      std::vector<File> path_results =
          search_files([NSString stringWithUTF8String:path.c_str()],
                       [NSString stringWithUTF8String:query.c_str()]);
      res.insert(res.end(), path_results.begin(), path_results.end());
    }

    auto arr_res = jsi::Array(rt, res.size());

    for (size_t i = 0; i < res.size(); i++) {
      auto result = res.at(i);
      auto obj = jsi::Object(rt);
      obj.setProperty(rt, "name", jsi::String::createFromUtf8(rt, result.name));
      obj.setProperty(rt, "path", jsi::String::createFromUtf8(rt, result.path));
      obj.setProperty(rt, "isFolder", result.is_folder);
      arr_res.setValueAtIndex(rt, i, std::move(obj));
    }

    return std::move(arr_res);
  });

  // auto getMediaInfo = HOSTFN("getMediaInfo", 0, [=]) {
  //   auto promise =
  //       rt.global()
  //           .getPropertyAsFunction(rt, "Promise")
  //           .callAsConstructor(
  //               rt,
  //               jsi::Function::createFromHostFunction(
  //                   rt, jsi::PropNameID::forAscii(rt, "executor"), 2,
  //                   [=](jsi::Runtime &rt, const jsi::Value &,
  //                       const jsi::Value *promiseArgs,
  //                       size_t count) -> jsi::Value {
  //                     auto resolve =
  //                         std::make_shared<jsi::Value>(rt, promiseArgs[0]);
  //                         dispatch_async(dispatch_get_main_queue(), ^{

  //                           [MediaHelper
  //                            getCurrentMedia:^(
  //                                             NSDictionary<NSString *,
  //                                              NSString *> *mediaInfo) {
  //                                                invoker->invokeAsync([&rt,
  //                                                mediaInfo, resolve] {
  //                                                  auto res =
  //                                                  jsi::Object(rt);
  //                                                  res.setProperty(
  //                                                                  rt,
  //                                                                  "title",
  //                                                                  std::string([[mediaInfo
  //                                                                  objectForKey:@"title"]
  //                                                                               UTF8String]));
  //                                                  res.setProperty(
  //                                                                  rt,
  //                                                                  "artist",
  //                                                                  std::string([[mediaInfo
  //                                                                                objectForKey:@"artist"] UTF8String]));
  //                                                  res.setProperty(
  //                                                                  rt,
  //                                                                  "artwork",
  //                                                                  std::string([[mediaInfo
  //                                                                                objectForKey:@"artwork"] UTF8String]));
  //                                                  res.setProperty(
  //                                                                  rt,
  //                                                                  "bundleIdentifier",
  //                                                                  std::string([[mediaInfo
  //                                                                                objectForKey:@"bundleIdentifier"]
  //                                                                               UTF8String]));
  //                                                  res.setProperty(
  //                                                                  rt,
  //                                                                  "url",
  //                                                                  std::string([[mediaInfo
  //                                                                  objectForKey:@"url"]
  //                                                                               UTF8String]));
  //                                                  resolve->asObject(rt).asFunction(rt).call(
  //                                                                                            rt, std::move(res));
  //                                                });
  //                                              }];
  //                         });

  //                     return {};
  //                   }));

  //   return promise;
  // });

  auto requestCalendarAccess = HOSTFN("requestCalendarAccess", []) {
    auto promiseConstructor = rt.global().getPropertyAsFunction(rt, "Promise");

    auto promise = promiseConstructor.callAsConstructor(rt, HOSTFN("executor", []) {
      auto resolve = std::make_shared<jsi::Value>(rt, arguments[0]);

      [calendarHelper requestCalendarAccess:^{
        resolve->asObject(rt).asFunction(rt).call(rt);
      }];

      return {};
    }));
    return promise;
  });

  auto getCalendarAuthorizationStatus =
      HOSTFN("getCalendarAuthorizationStatus", []) {
    NSString *status = [calendarHelper getCalendarAuthorizationStatus];
    std::string statusStd = std::string([status UTF8String]);
    return jsi::String::createFromUtf8(rt, statusStd);
  });

  auto getEvents = HOSTFN("getEvents", []) {
    auto promiseCtr = rt.global().getPropertyAsFunction(rt, "Promise");
    auto promise = promiseCtr.callAsConstructor(
                                                rt, HOSTFN("executor", []) {
      auto resolve = std::make_shared<jsi::Value>(rt, arguments[0]);
      auto reject = std::make_shared<jsi::Value>(rt, arguments[1]);

      dispatch_async(dispatch_get_global_queue(QOS_CLASS_BACKGROUND, 0), ^{
        @try {
          NSArray<EKEvent *> *ekEvents = [calendarHelper getEvents];

          invoker->invokeAsync([resolve, ekEvents = ekEvents, &rt]() mutable {
            auto events = jsi::Array(rt, ekEvents.count);
            NSString *colorString = @"";
            auto count = ekEvents.count;

            for (int i = 0; i < ekEvents.count; i++) {
              EKEvent *ekEvent = [ekEvents objectAtIndex:i];
              //            bool hasDeclined = false;

              // If current user has declined the event: skip
              if ([ekEvent hasAttendees]) {
                NSArray<EKParticipant *> *participants = [ekEvent attendees];
                for (int j = 0; j < participants.count; j++) {
                  EKParticipant *participant = [participants objectAtIndex:j];
                  if ([participant isCurrentUser] == YES &&
                      [participant participantStatus] ==
                          EKParticipantStatusDeclined) {
                    continue;
                  }
                }
              }

              auto color = [[ekEvent calendar] color];
              
              CGFloat redFloatValue, greenFloatValue, blueFloatValue;
              int redIntValue, greenIntValue, blueIntValue;
              NSString *redHexValue, *greenHexValue, *blueHexValue;
              
              // Convert the NSColor to the RGB color space before we can access its
              // components
              NSColor *convertedColor =
              [color colorUsingColorSpace:[NSColorSpace genericRGBColorSpace]];
              
              if (convertedColor) {
                // Get the red, green, and blue components of the color
                [convertedColor getRed:&redFloatValue
                                 green:&greenFloatValue
                                  blue:&blueFloatValue
                                 alpha:NULL];
                
                // Convert the components to numbers (unsigned decimal integer) between
                // 0 and 255
                redIntValue = redFloatValue * 255.99999f;
                greenIntValue = greenFloatValue * 255.99999f;
                blueIntValue = blueFloatValue * 255.99999f;
                
                // Convert the numbers to hex strings
                redHexValue = [NSString stringWithFormat:@"%02x", redIntValue];
                greenHexValue = [NSString stringWithFormat:@"%02x", greenIntValue];
                blueHexValue = [NSString stringWithFormat:@"%02x", blueIntValue];
                
                // Concatenate the red, green, and blue components' hex strings together
                // with a "#"
                colorString = [NSString stringWithFormat:@"#%@%@%@", redHexValue,
                               greenHexValue, blueHexValue];
              }


              jsi::Object event = jsi::Object(rt);
              event.setProperty(rt, "id", [[ekEvent eventIdentifier] UTF8String]);
              auto title =
                  jsi::String::createFromUtf8(rt, [[ekEvent title] UTF8String]);
              event.setProperty(rt, "title", title);
              if ([ekEvent URL] != NULL) {
                event.setProperty(rt, "url",
                                  [[[ekEvent URL] absoluteString] UTF8String]);
              }
              if ([ekEvent notes] != NULL) {
                auto notes =
                    jsi::String::createFromUtf8(rt, [[ekEvent notes] UTF8String]);
                event.setProperty(rt, "notes", std::move(notes));
              }

              if ([ekEvent location] != NULL) {
                event.setProperty(rt, "location",
                                  [[ekEvent location] UTF8String]);
              }

              event.setProperty(rt, "color", [colorString UTF8String]);
              if ([ekEvent startDate] != NULL) {
                event.setProperty(
                    rt, "date",
                    [[dateFormatter stringFromDate:[ekEvent startDate]]
                        UTF8String]);
              }
              if ([ekEvent endDate] != NULL) {
                event.setProperty(
                    rt, "endDate",
                    [[dateFormatter stringFromDate:[ekEvent endDate]]
                        UTF8String]);
              }
              event.setProperty(
                  rt, "isAllDay",
                  jsi::Value(static_cast<bool>([ekEvent isAllDay])));

              event.setProperty(rt, "eventStatus",
                                jsi::Value(static_cast<int>([ekEvent status])));

              event.setProperty(
                  rt, "availability",
                  jsi::Value(static_cast<int>([ekEvent availability])));

              //            if ([ekEvent hasAttendees]) {
              //              for (EKParticipant *participant in
              //              ekEvent.attendees) {
              //                if ([participant isCurrentUser]) {
              //
              //                  if (participant.participantStatus ==
              //                      EKParticipantStatusAccepted) {
              //                    event.setProperty(rt, "status",
              //                    jsi::Value(1));
              //                  } else if (participant.participantStatus ==
              //                             EKParticipantStatusDeclined) {
              //                    event.setProperty(rt, "status",
              //                    jsi::Value(3));
              //                  } else {
              //                    event.setProperty(rt, "status",
              //                    jsi::Value(0));
              //                  }
              //                }
              //              }
              //            }

              //      NSLog(@"Event name %@ organizer %@", [[ekEvent title] UTF],
              //      [[ekEvent organizer] name]);

              //      if([ekEvent organizer]) {
              //        event.setProperty(rt, "status", jsi::Value(1));
              //      }

              //            event.setProperty(rt, "declined",
              //            jsi::Value(hasDeclined));

              events.setValueAtIndex(rt, i, event);
            }

            resolve->asObject(rt).asFunction(rt).call(rt, events);
          });
        } @catch (NSException *exception) {
          NSLog(@"Error in getEvents: %@", exception);
          invoker->invokeAsync([reject, exception, &rt]() mutable {
            NSString *errorMessage = [NSString stringWithFormat:@"Failed to fetch calendar events: %@", [exception reason]];
            auto error = jsi::String::createFromUtf8(rt, [errorMessage UTF8String]);
            reject->asObject(rt).asFunction(rt).call(rt, error);
          });
        }
      });
      return {};
                                                }));

    return promise;
  });

  auto ls = HOSTFN("ls", []) {
    NSString *path = sol::jsiValueToNSString(rt, arguments[0]);
    NSError *error;
    NSArray *contents = [FS lsWithPath:path error:&error];

    if (error) {
      throw jsi::JSError(rt, sol::NSStringToJsiValue(rt, error.description));
    }

    auto res = jsi::Array(rt, contents.count);

    for (int i = 0; i < contents.count; i++) {
      res.setValueAtIndex(rt, i, sol::NSStringToJsiValue(rt, contents[i]));
    }

    return res;
  });

  auto exists = HOSTFN("exists", []) {
    NSString *path = sol::jsiValueToNSString(rt, arguments[0]);

    bool exists = static_cast<bool>([FS existsWithPath:path]);

    return jsi::Value(exists);
  });

  auto readFile = HOSTFN("readFile", []) {
    NSString *path = sol::jsiValueToNSString(rt, arguments[0]);

    NSString *contents = [FS readFileWithPath:path];

    if (contents == nil) {
      return jsi::Value::null();
    }

    return sol::NSStringToJsiValue(rt, contents);
  });

  auto userName = HOSTFN("userName", []) {
    NSString *userName = NSUserName();
    return sol::NSStringToJsiValue(rt, userName);
  });

  auto ps = HOSTFN("ps", []) {

    NSPipe *pipe = [[NSPipe alloc] init];
    NSFileHandle *file = [pipe fileHandleForReading];
    NSTask *psTask = [[NSTask alloc] init];

    [psTask setLaunchPath:@"/bin/ps"];

    [psTask
        setArguments:[NSArray
                         arrayWithObjects:@"-eo pid,ppid,pcpu,rss,comm", nil]];
    psTask.standardOutput = pipe;

    [psTask launch];

    NSData *data;
    data = [file readDataToEndOfFile];

    NSString *string;
    string = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];

    return sol::NSStringToJsiValue(rt, string);
  });

  auto killProcess = HOSTFN("killProcess", []) {
    NSString *pid = sol::jsiValueToNSString(rt, arguments[0]);

    NSTask *killTask = [[NSTask alloc] init];

    [killTask setLaunchPath:@"/bin/kill"];

    [killTask setArguments:[NSArray arrayWithObjects:@"-9", pid, nil]];

    [killTask launch];

    return {};
  });

  auto log = HOSTFN("log", []) {
    NSString *msg = sol::jsiValueToNSString(rt, arguments[0]);
    NSLog(@"%@", msg);
    return {};
  });

  auto getApplications = HOSTFN("getApplications", []) {
    auto promiseCtr = rt.global().getPropertyAsFunction(rt, "Promise");
    auto promise = promiseCtr.callAsConstructor(
        rt, HOSTFN("executor", []) {
      auto resolve = std::make_shared<jsi::Value>(rt, arguments[0]);
      auto reject = std::make_shared<jsi::Value>(rt, arguments[1]);

      dispatch_async(dispatch_get_global_queue(QOS_CLASS_BACKGROUND, 0), ^{
        @try {
          NSArray *apps = [[ApplicationSearcher shared] getAllApplications];

          invoker->invokeAsync([resolve, apps, &rt]() mutable {
            jsi::Array appsArray(rt, apps.count);
            for (NSUInteger i = 0; i < apps.count; i++) {
              NSDictionary *nsApp = [apps objectAtIndex:i];
              jsi::Object app = jsi::Object(rt);

              NSString *nsName = [nsApp valueForKey:@"name"];
              jsi::String name =
                  jsi::String::createFromUtf8(rt, [nsName UTF8String]);
              app.setProperty(rt, "name", name);

              NSString *nsUrl = [nsApp valueForKey:@"url"];
              jsi::String url =
                  jsi::String::createFromUtf8(rt, [nsUrl UTF8String]);
              app.setProperty(rt, "url", url);

              app.setProperty(rt, "isRunning",
                              jsi::Value([nsApp valueForKey:@"isRunning"]));

              appsArray.setValueAtIndex(rt, i, app);
            }

            resolve->asObject(rt).asFunction(rt).call(rt, std::move(appsArray));
          });
        } @catch (NSException *exception) {
          NSLog(@"Error in getApplications: %@", exception);
          invoker->invokeAsync([reject, exception, &rt]() mutable {
            NSString *errorMessage = [NSString stringWithFormat:@"Failed to fetch applications: %@", [exception reason]];
            auto error = jsi::String::createFromUtf8(rt, [errorMessage UTF8String]);
            reject->asObject(rt).asFunction(rt).call(rt, error);
          });
        }
      });
      return {};
        }));

    return promise;
  });

  auto mkdir = HOSTFN("mkdir", []) {
    NSString *path = sol::jsiValueToNSString(rt, arguments[0]);
    NSError *error = nil;
    
    BOOL success = [[NSFileManager defaultManager] 
                    createDirectoryAtPath:path 
                    withIntermediateDirectories:YES 
                    attributes:nil 
                    error:&error];
    
    if (!success || error) {
      throw jsi::JSError(rt, sol::NSStringToJsiValue(rt, error.localizedDescription));
    }
    
    return jsi::Value(success);
  });

  auto cp = HOSTFN("cp", []) {
    NSString *sourcePath = sol::jsiValueToNSString(rt, arguments[0]);
    NSString *destPath = sol::jsiValueToNSString(rt, arguments[1]);
    NSError *error = nil;
    
    BOOL success = [[NSFileManager defaultManager] 
                    copyItemAtPath:sourcePath 
                    toPath:destPath 
                    error:&error];
    
    if (!success || error) {
      throw jsi::JSError(rt, sol::NSStringToJsiValue(rt, error.localizedDescription));
    }
    
    return jsi::Value(success);
  });

  auto del = HOSTFN("del", []) {
    NSString *path = sol::jsiValueToNSString(rt, arguments[0]);
    NSError *error = nil;
    
    BOOL success = [[NSFileManager defaultManager] 
                    removeItemAtPath:path 
                    error:&error];
    
    if (!success || error) {
      throw jsi::JSError(rt, sol::NSStringToJsiValue(rt, error.localizedDescription));
    }
    
    return jsi::Value(success);
  });
  
  auto createFolderWatcher = HOSTFN("createFolderWatcher", []) {
    auto path = jsiValueToString(rt, arguments[0]);
    auto callback = std::make_shared<jsi::Value>(rt, arguments[1]);
    auto folderWatcher = std::make_shared<FolderWatcherJSI>(rt, path, callback);
    return jsi::Object::createFromHostObject(rt, folderWatcher);
  });


  jsi::Object module = jsi::Object(rt);

  module.setProperty(rt, "setHeight", std::move(setHeight));
  module.setProperty(rt, "resetWindowSize", std::move(resetWindowSize));
  module.setProperty(rt, "hideWindow", std::move(hideWindow));
  module.setProperty(rt, "showWindow", std::move(showWindow));
  // module.setProperty(rt, "getMediaInfo", std::move(getMediaInfo));
  module.setProperty(rt, "searchFiles", std::move(searchFiles));
  module.setProperty(rt, "requestCalendarAccess",
                     std::move(requestCalendarAccess));
  module.setProperty(rt, "getCalendarAuthorizationStatus",
                     std::move(getCalendarAuthorizationStatus));
  module.setProperty(rt, "getEvents", std::move(getEvents));
  module.setProperty(rt, "ls", std::move(ls));
  module.setProperty(rt, "exists", std::move(exists));
  module.setProperty(rt, "userName", std::move(userName));
  module.setProperty(rt, "readFile", std::move(readFile));
  module.setProperty(rt, "ps", std::move(ps));
  module.setProperty(rt, "killProcess", std::move(killProcess));
  module.setProperty(rt, "getWifiPassword", std::move(getWifiPassword));
  module.setProperty(rt, "getWifiInfo", std::move(getWifiInfo));
  module.setProperty(rt, "log", std::move(log));
  module.setProperty(rt, "getApplications", std::move(getApplications));
  module.setProperty(rt, "mkdir", std::move(mkdir));
  module.setProperty(rt, "cp", std::move(cp));
  module.setProperty(rt, "del", std::move(del));
  module.setProperty(rt, "createFolderWatcher", std::move(createFolderWatcher));

  rt.global().setProperty(rt, "__SolProxy", std::move(module));
}

} // namespace sol
