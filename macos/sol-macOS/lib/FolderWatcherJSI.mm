#include "FolderWatcherJSI.h"
#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>
#include <memory>
#include <string>
#import <Foundation/Foundation.h>

namespace sol {

namespace jsi = facebook::jsi;
namespace react = facebook::react;

extern std::shared_ptr<react::CallInvoker> invoker;


static void FolderWatcherCallback(ConstFSEventStreamRef streamRef,
								  void *clientCallBackInfo,
								  size_t numEvents,
								  void *eventPaths,
								  const FSEventStreamEventFlags eventFlags[],
								  const FSEventStreamEventId eventIds[]) {
	FolderWatcherJSI *watcher = static_cast<FolderWatcherJSI *>(clientCallBackInfo);
	char **paths = (char **)eventPaths;
	for (size_t i = 0; i < numEvents; ++i) {
		std::string pathStr(paths[i]);
		std::string changeType = "modified";
		if ((eventFlags[i] & kFSEventStreamEventFlagItemCreated) != 0) {
			changeType = "created";
		} else if ((eventFlags[i] & kFSEventStreamEventFlagItemRemoved) != 0) {
			changeType = "deleted";
		}
		if (watcher->callback && sol::invoker) {
			auto cb = watcher->callback;
			auto &rt = watcher->rt;
			// Capture values for async invocation
			sol::invoker->invokeAsync([cb, &rt, pathStr, changeType]() mutable {
				if (cb && cb->isObject()) {
					auto func = cb->asObject(rt).asFunction(rt);
					func.call(rt,
						facebook::jsi::String::createFromUtf8(rt, pathStr),
						facebook::jsi::String::createFromUtf8(rt, changeType)
					);
				}
			});
		}
	}
}

FolderWatcherJSI::FolderWatcherJSI(jsi::Runtime &rt, std::string path, std::shared_ptr<jsi::Value> cb)
	: rt(rt), path(path), callback(cb) {
	FSEventStreamContext context = {
		0,
		this,
		nullptr,
		nullptr,
		nullptr
	};
	cfPath = CFStringCreateWithCString(nullptr, path.c_str(), kCFStringEncodingUTF8);
	pathsToWatch = CFArrayCreate(nullptr, (const void**)&cfPath, 1, &kCFTypeArrayCallBacks);
	streamRef = FSEventStreamCreate(nullptr,
								   &FolderWatcherCallback,
								   &context,
								   pathsToWatch,
								   kFSEventStreamEventIdSinceNow,
								   0.5,
								   kFSEventStreamCreateFlagFileEvents | kFSEventStreamCreateFlagNoDefer);
	if (streamRef) {
		FSEventStreamScheduleWithRunLoop(streamRef, CFRunLoopGetMain(), kCFRunLoopDefaultMode);
		FSEventStreamStart(streamRef);
	}
}

FolderWatcherJSI::~FolderWatcherJSI() {
	if (streamRef) {
		FSEventStreamStop(streamRef);
		FSEventStreamInvalidate(streamRef);
		FSEventStreamRelease(streamRef);
		streamRef = nullptr;
	}
	if (cfPath) {
		CFRelease(cfPath);
		cfPath = nullptr;
	}
	if (pathsToWatch) {
		CFRelease(pathsToWatch);
		pathsToWatch = nullptr;
	}
}


} // namespace sol

