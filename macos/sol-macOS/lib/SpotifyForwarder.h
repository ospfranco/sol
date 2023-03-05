//
//  SpotifyForwarder.h
//  macOS
//
//  Created by Oscar Franco on 05.03.23.
//

#ifndef SpotifyForwarder_h
#define SpotifyForwarder_h

@interface SpotifyForwarder:NSObject
{
  CFMachPortRef eventPort;
  CFRunLoopSourceRef eventPortSource;
}

- (instancetype)init;
- ( void ) startEventSession;
- ( void ) stopEventSession;
@end


#endif /* SpotifyForwarder_h */
