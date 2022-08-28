//
//  JSIBindings.hpp
//  macOS
//
//  Created by Oscar on 28.08.22.
//

#ifndef JSIBindings_hpp
#define JSIBindings_hpp

#include <jsi/jsi.h>

namespace sol {

namespace jsi = facebook::jsi;

void install(jsi::Runtime &runtime);

}

#endif /* JSIBindings_hpp */
