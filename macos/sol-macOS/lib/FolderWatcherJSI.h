
#pragma once
#include <jsi/jsi.h>
#include "AsyncJS.h"
#include <memory>
#include <string>
#include <CoreServices/CoreServices.h>

namespace sol {

namespace jsi = facebook::jsi;


class JSI_EXPORT FolderWatcherJSI: public jsi::HostObject {
public:
  FolderWatcherJSI(jsi::Runtime &rt, std::shared_ptr<react::CallInvoker> invoker,
                   std::string path, const jsi::Value &callback);
  ~FolderWatcherJSI();

  void startStream();
  void stopStream();
  void handleWakeNotification();

  std::string path;
  KeptFunction callback;
  FSEventStreamRef streamRef = nullptr;
  CFStringRef cfPath = nullptr;
  CFArrayRef pathsToWatch = nullptr;
  id wakeObserver = nil;
};

} // namespace sol

