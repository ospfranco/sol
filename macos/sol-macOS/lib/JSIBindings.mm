#include <iostream>
#include "JSIBindings.hpp"
#include "SolMacros.h"
#import <Cocoa/Cocoa.h>
#import <Foundation/Foundation.h>
#import <sol-Swift.h>

namespace sol {

namespace jsi = facebook::jsi;
namespace react = facebook::react;

void install(jsi::Runtime &rt, std::shared_ptr<react::CallInvoker> callInvoker) {

  auto setHeight = HOSTFN("setHeight", 1, []) {
    int height = static_cast<int>(arguments[0].asNumber());
    dispatch_async(dispatch_get_main_queue(), ^{
      AppDelegate* appDelegate = (AppDelegate *)[[NSApplication sharedApplication] delegate];
      [appDelegate setHeight:height];
    });

    return {};
  });

  auto resetWindowSize = HOSTFN("resetWindowSize", 0, []) {
    dispatch_async(dispatch_get_main_queue(), ^{
      AppDelegate* appDelegate = (AppDelegate *)[[NSApplication sharedApplication] delegate];
      [appDelegate resetSize];
    });

    return {};
  });

  auto hideWindow = HOSTFN("hideWindow", 0, []) {
    dispatch_async(dispatch_get_main_queue(), ^{
      AppDelegate* appDelegate = (AppDelegate *)[[NSApplication sharedApplication] delegate];
      [appDelegate hideWindow];
    });

    return {};
  });

  jsi::Object module = jsi::Object(rt);

  module.setProperty(rt, "setHeight", std::move(setHeight));
  module.setProperty(rt, "resetWindowSize", std::move(resetWindowSize));
  module.setProperty(rt, "hideWindow", std::move(hideWindow));

  rt.global().setProperty(rt, "__SolProxy", std::move(module));
}

}

