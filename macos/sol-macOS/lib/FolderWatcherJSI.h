
#pragma once
#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <CoreServices/CoreServices.h>

namespace sol {

namespace jsi = facebook::jsi;

class JSI_EXPORT FolderWatcherJSI: public jsi::HostObject {
public:
  FolderWatcherJSI(jsi::Runtime &rt, std::string path, std::shared_ptr<jsi::Value> callback);
  ~FolderWatcherJSI();

  jsi::Runtime &rt;
  std::string path;
  std::shared_ptr<jsi::Value> callback;
  FSEventStreamRef streamRef = nullptr;
  CFStringRef cfPath = nullptr;
  CFArrayRef pathsToWatch = nullptr;
};

} // namespace sol

