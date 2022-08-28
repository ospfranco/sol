#include "JSIBindings.hpp"
#include "SolMacros.h"
#import <Cocoa/Cocoa.h>
#import <Foundation/Foundation.h>
#include <iostream>
#import <sol-Swift.h>
#import <string>

namespace sol {

namespace jsi = facebook::jsi;
namespace react = facebook::react;

std::shared_ptr<react::CallInvoker> invoker;
FileSearcher* fileSearcher;

void install(jsi::Runtime &rt,
             std::shared_ptr<react::CallInvoker> callInvoker) {
  invoker = callInvoker;
  fileSearcher = [[FileSearcher alloc] init];

  auto setHeight = HOSTFN("setHeight", 1, []) {
    int height = static_cast<int>(arguments[0].asNumber());
    dispatch_async(dispatch_get_main_queue(), ^{
      AppDelegate *appDelegate =
          (AppDelegate *)[[NSApplication sharedApplication] delegate];
      [appDelegate setHeight:height];
    });

    return {};
  });

  auto resetWindowSize = HOSTFN("resetWindowSize", 0, []) {
    dispatch_async(dispatch_get_main_queue(), ^{
      AppDelegate *appDelegate =
          (AppDelegate *)[[NSApplication sharedApplication] delegate];
      [appDelegate resetSize];
    });

    return {};
  });

  auto hideWindow = HOSTFN("hideWindow", 0, []) {
    dispatch_async(dispatch_get_main_queue(), ^{
      AppDelegate *appDelegate =
          (AppDelegate *)[[NSApplication sharedApplication] delegate];
      [appDelegate hideWindow];
    });

    return {};
  });

  auto searchFiles = HOSTFN("searchFiles", 1, []) {
    auto queryStr = arguments[0].asString(rt).utf8(rt);
    [fileSearcher searchFile: [NSString stringWithUTF8String:queryStr.c_str()]];
    return {};
  });

  auto getMediaInfo = HOSTFN("getMediaInfo", 0, [=]) {
    auto promise =
        rt.global()
            .getPropertyAsFunction(rt, "Promise")
            .callAsConstructor(
                rt,
                jsi::Function::createFromHostFunction(
                    rt, jsi::PropNameID::forAscii(rt, "executor"), 2,
                    [=](jsi::Runtime &rt, const jsi::Value &,
                        const jsi::Value *promiseArgs,
                        size_t count) -> jsi::Value {
                      auto resolve =
                          std::make_shared<jsi::Value>(rt, promiseArgs[0]);
                      [MediaHelper
                          getCurrentMedia:^(
                              NSDictionary<NSString *, NSString *> *mediaInfo) {
                            invoker->invokeAsync([&rt, mediaInfo, resolve] {
                              auto res = jsi::Object(rt);
                              res.setProperty(
                                  rt, "title",
                                  std::string([[mediaInfo objectForKey:@"title"]
                                      UTF8String]));
                              res.setProperty(
                                  rt, "artist",
                                  std::string([[mediaInfo
                                      objectForKey:@"artist"] UTF8String]));
                              res.setProperty(
                                  rt, "artwork",
                                  std::string([[mediaInfo
                                      objectForKey:@"artwork"] UTF8String]));
                              res.setProperty(
                                  rt, "bundleIdentifier",
                                  std::string([[mediaInfo
                                      objectForKey:@"bundleIdentifier"]
                                      UTF8String]));
                              res.setProperty(
                                  rt, "url",
                                  std::string([[mediaInfo objectForKey:@"url"]
                                      UTF8String]));
                              resolve->asObject(rt).asFunction(rt).call(
                                  rt, std::move(res));
                            });
                          }];

                      return {};
                    }));

    return promise;
  });

  jsi::Object module = jsi::Object(rt);

  module.setProperty(rt, "setHeight", std::move(setHeight));
  module.setProperty(rt, "resetWindowSize", std::move(resetWindowSize));
  module.setProperty(rt, "hideWindow", std::move(hideWindow));
  module.setProperty(rt, "getMediaInfo", std::move(getMediaInfo));
  module.setProperty(rt, "searchFiles", std::move(searchFiles));

  rt.global().setProperty(rt, "__SolProxy", std::move(module));
}

}
