#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE (BlurViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(startColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(endColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(cornerRadius, double)
RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(materialName, NSString)
@end
