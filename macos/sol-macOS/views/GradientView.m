#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE (GradientViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(startColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(endColor, NSString)
RCT_EXPORT_VIEW_PROPERTY(angle, double)
RCT_EXPORT_VIEW_PROPERTY(cornerRadius, double)
@end
