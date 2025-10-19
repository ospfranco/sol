#import <Foundation/Foundation.h>
#import "JSIUtils.h"

namespace sol {

namespace jsi = facebook::jsi;

std::string jsiValueToString(jsi::Runtime &rt, const jsi::Value &v) {
  if(!v.isString()) {
    throw jsi::JSError(rt, "Invalid string marshalling");
  }
  auto str = v.asString(rt).utf8(rt);
  return str;
}

NSString* jsiValueToNSString(jsi::Runtime &rt, const jsi::Value &v) {
  if(!v.isString()) {
    throw jsi::JSError(rt, "Invalid string marshalling");
  }

  auto str = v.asString(rt).utf8(rt);
  NSString* result = [[NSString alloc] initWithUTF8String:str.c_str()];

  return result;
}

double jsiValueToDouble(jsi::Runtime &rt, const jsi::Value &v) {
  if(!v.isNumber()) {
    throw jsi::JSError(rt, "Invalid number marshalling");
  }

  return v.asNumber();
}

NSDate* jsiValueToNSDate(jsi::Runtime &rt, const jsi::Value &v) {
  if(!v.isNumber()) {
    throw jsi::JSError(rt, "Invalid date marshalling");
  }

  NSDate *date = [NSDate dateWithTimeIntervalSince1970:static_cast<double>(v.asNumber())];

  return date;
}

jsi::Value NSDateToJsiValue(jsi::Runtime &rt, NSDate* date) {
  return jsi::Value(static_cast<int>([date timeIntervalSince1970]));
}

jsi::Value NSStringToJsiValue(jsi::Runtime &rt, NSString* v) {
  auto res = jsi::String::createFromAscii(rt, [v UTF8String]);
  return res;
}

}
