#ifndef JSIBindings_hpp
#define JSIBindings_hpp

#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>
#include <memory>

namespace sol {

namespace jsi = facebook::jsi;
namespace react = facebook::react;

void install(jsi::Runtime &runtime, std::shared_ptr<react::CallInvoker> callInvoker);

}

#endif /* JSIBindings_hpp */
