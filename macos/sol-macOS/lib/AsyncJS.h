#pragma once

// Handing results from native work back to JS, safely across runtime restarts.
//
// A JS value belongs to one runtime: it may only be used, or freed, on that
// runtime's JS thread while the runtime is alive. Sol restarts its runtime
// (RNRestart on every light/dark change, and on reload), so native work that
// holds a `resolve`, a callback or a `jsi::Runtime &` can outlive it. When that
// work finishes it either frees the value on a background queue after the
// runtime is gone, or runs on the *next* runtime (through the global `invoker`)
// with the old runtime's values. Both segfault in jsi::Value::~Value().
//
// So native code never holds JS values across async work. They stay inside the
// runtime that made them, in a Map on `global`, and native code keeps only a
// key plus that runtime's own CallInvoker. Results go back through that invoker,
// which runs them on the right JS thread with the right runtime, or drops them
// if the runtime is gone. Dropping is always safe: the queued work holds no JS
// values, only plain C++/Objective-C data.

#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>

#include <atomic>
#include <functional>
#include <memory>
#include <string>

namespace sol {

namespace jsi = facebook::jsi;
namespace react = facebook::react;

namespace kept {

// The runtime's table of JS values kept for native code: global.__solKept, a Map.
inline jsi::Object table(jsi::Runtime &rt) {
  auto global = rt.global();
  auto existing = global.getProperty(rt, "__solKept");
  if (existing.isObject()) {
    return existing.asObject(rt);
  }
  auto map = global.getPropertyAsFunction(rt, "Map").callAsConstructor(rt).asObject(rt);
  global.setProperty(rt, "__solKept", map);
  return map;
}

inline double nextKey() {
  static std::atomic<uint64_t> counter{0};
  return static_cast<double>(++counter);
}

inline void put(jsi::Runtime &rt, double key, const jsi::Value &value) {
  auto map = table(rt);
  map.getPropertyAsFunction(rt, "set").callWithThis(rt, map, key, value);
}

inline jsi::Value get(jsi::Runtime &rt, double key) {
  auto map = table(rt);
  return map.getPropertyAsFunction(rt, "get").callWithThis(rt, map, key);
}

inline void remove(jsi::Runtime &rt, double key) {
  auto map = table(rt);
  map.getPropertyAsFunction(rt, "delete").callWithThis(rt, map, key);
}

} // namespace kept

// Builds a JS value on the JS thread, from data captured by value.
using MakeValue = std::function<jsi::Value(jsi::Runtime &)>;

// The settle side of a promise made by makePromise. Copyable, and safe to use
// from any thread, after any delay: if the promise's runtime is gone, settling
// does nothing.
class Deferred {
public:
  Deferred(std::shared_ptr<react::CallInvoker> invoker, double key)
      : invoker_(std::move(invoker)), key_(key) {}

  void resolve(MakeValue make) const { settle(std::move(make), "resolve"); }

  void resolve() const {
    resolve([](jsi::Runtime &) { return jsi::Value::undefined(); });
  }

  void reject(std::string message) const {
    settle(
        [message = std::move(message)](jsi::Runtime &rt) {
          return jsi::Value(jsi::String::createFromUtf8(rt, message));
        },
        "reject");
  }

private:
  void settle(MakeValue make, const char *which) const {
    if (!invoker_) {
      return;
    }
    invoker_->invokeAsync(
        [key = key_, make = std::move(make), which](jsi::Runtime &rt) {
          auto entry = kept::get(rt, key);
          if (!entry.isObject()) {
            return; // already settled
          }
          kept::remove(rt, key);
          auto fn = entry.asObject(rt).getPropertyAsFunction(rt, which);
          fn.call(rt, make(rt));
        });
  }

  std::shared_ptr<react::CallInvoker> invoker_;
  double key_;
};

// Returns a JS promise and hands `start` its Deferred. Call on the JS thread,
// with the invoker of the runtime `rt` belongs to. `start` runs synchronously
// and typically dispatches the real work elsewhere.
inline jsi::Value makePromise(jsi::Runtime &rt,
                              std::shared_ptr<react::CallInvoker> invoker,
                              std::function<void(Deferred)> start) {
  auto key = kept::nextKey();
  auto executor = jsi::Function::createFromHostFunction(
      rt, jsi::PropNameID::forAscii(rt, "executor"), 2,
      [key, invoker, start = std::move(start)](
          jsi::Runtime &rt, const jsi::Value &, const jsi::Value *args,
          size_t count) -> jsi::Value {
        jsi::Object entry(rt);
        entry.setProperty(rt, "resolve", args[0]);
        entry.setProperty(rt, "reject", args[1]);
        kept::put(rt, key, jsi::Value(rt, entry));
        start(Deferred(invoker, key));
        return jsi::Value::undefined();
      });
  return rt.global()
      .getPropertyAsFunction(rt, "Promise")
      .callAsConstructor(rt, executor);
}

// A JS function kept for repeated calls from native code (e.g. a file watcher).
// Copyable, and safe to call from any thread; calls after its runtime is gone
// do nothing. Call forget() when native code is done with it.
class KeptFunction {
public:
  KeptFunction(jsi::Runtime &rt, std::shared_ptr<react::CallInvoker> invoker,
               const jsi::Value &fn)
      : invoker_(std::move(invoker)), key_(kept::nextKey()) {
    kept::put(rt, key_, fn);
  }

  // `body` runs on the JS thread with the function; capture only plain data.
  void call(std::function<void(jsi::Runtime &, jsi::Function &)> body) const {
    if (!invoker_) {
      return;
    }
    invoker_->invokeAsync([key = key_, body = std::move(body)](jsi::Runtime &rt) {
      auto fn = kept::get(rt, key);
      if (!fn.isObject() || !fn.asObject(rt).isFunction(rt)) {
        return;
      }
      auto f = fn.asObject(rt).asFunction(rt);
      body(rt, f);
    });
  }

  void forget() const {
    if (!invoker_) {
      return;
    }
    invoker_->invokeAsync([key = key_](jsi::Runtime &rt) { kept::remove(rt, key); });
  }

private:
  std::shared_ptr<react::CallInvoker> invoker_;
  double key_;
};

} // namespace sol
