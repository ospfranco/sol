//
//  SolMacros.h
//  sol
//
//  Created by Oscar on 28.08.22.
//

#ifndef SolMacros_h
#define SolMacros_h

#define HOSTFN(name, size, capture) \
jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, name), size, \
capture(jsi::Runtime &runtime, const jsi::Value &thisValue, \
const jsi::Value *arguments, size_t count)          \
->jsi::Value


#define JSIFN(capture)                                         \
capture(jsi::Runtime &runtime, const jsi::Value &thisValue, \
const jsi::Value *arguments, size_t count)          \
->jsi::Value

#endif /* SolMacros_h */
