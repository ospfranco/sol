//
//  SolMacros.h
//  sol
//
//  Created by Oscar on 28.08.22.
//

#ifndef SolMacros_h
#define SolMacros_h

#define HOSTFN(name, capture) \
jsi::Function::createFromHostFunction(rt, jsi::PropNameID::forAscii(rt, name), 0, \
capture(jsi::Runtime &rt, const jsi::Value &thisValue, \
const jsi::Value *arguments, size_t count)          \
->jsi::Value


#define JSIFN(capture)                                         \
capture(jsi::Runtime &rt, const jsi::Value &thisValue, \
const jsi::Value *arguments, size_t count)          \
->jsi::Value

#endif /* SolMacros_h */
