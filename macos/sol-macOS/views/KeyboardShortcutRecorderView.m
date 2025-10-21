#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE (KeyboardShortcutRecorderViewManager,
                              RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(onShortcutChange, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onCancel, RCTBubblingEventBlock)
@end
