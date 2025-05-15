#ifndef MediaKeyForwarder_h
#define MediaKeyForwarder_h

#import <Foundation/Foundation.h>

@interface MediaKeyForwarder:NSObject
{
  CFMachPortRef eventPort;
  CFRunLoopSourceRef eventPortSource;
}

- (instancetype)init;
- ( void ) startEventSession;
- ( void ) stopEventSession;
@end


#endif
