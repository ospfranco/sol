#include <Carbon/Carbon.h>

typedef void *CGSConnectionID;
// extern CGSConnectionID _CGSDefaultConnection(void);

typedef CFStringRef CGSManagedDisplay;
extern CGSManagedDisplay kCGSPackagesMainDisplayIdentifier;
typedef uint64_t CGSSpace;

/// Representations of the possible types of spaces the system can create.
typedef enum {
  /// User-created desktop spaces.
  CGSSpaceTypeUser = 0,
  /// Fullscreen spaces.
  CGSSpaceTypeFullscreen = 1,
  /// System spaces e.g. Dashboard.
  CGSSpaceTypeSystem = 2,
} CGSSpaceType;

/// Flags that can be applied to queries for spaces.
typedef enum {
  CGSSpaceIncludesCurrent = 1 << 0,
  CGSSpaceIncludesOthers = 1 << 1,
  CGSSpaceIncludesUser = 1 << 2,

  CGSSpaceVisible = 1 << 16,

  kCGSCurrentSpaceMask = CGSSpaceIncludesUser | CGSSpaceIncludesCurrent,
  kCGSOtherSpacesMask = CGSSpaceIncludesOthers | CGSSpaceIncludesCurrent,
  kCGSAllSpacesMask =
      CGSSpaceIncludesUser | CGSSpaceIncludesOthers | CGSSpaceIncludesCurrent,
  KCGSAllVisibleSpacesMask = CGSSpaceVisible | kCGSAllSpacesMask,
} CGSSpaceMask;

typedef enum {
  /// Each display manages a single contiguous space.
  kCGSPackagesSpaceManagementModeNone = 0,
  /// Each display manages a separate stack of spaces.
  kCGSPackagesSpaceManagementModePerDesktop = 1,
} CGSSpaceManagementMode;

#pragma mark - Space Lifecycle

/// Creates a new space with the given options dictionary.
///
/// Valid keys are:
///
///     "type": CFNumberRef
// ///     "uuid": CFStringRef
// CG_EXTERN CGSSpace CGSSpaceCreate(CGSConnectionID cid, void *null,
//                                     CFDictionaryRef options);

// /// Removes and destroys the space corresponding to the given space ID.
// CG_EXTERN void CGSSpaceDestroy(CGSConnectionID cid, CGSSpace sid);

// #pragma mark - Configuring Spaces

// /// Get and set the human-readable name of a space.
CG_EXTERN CFStringRef CGSSpaceCopyName(CGSConnectionID cid, CGSSpace sid);
// CG_EXTERN CGError CGSSpaceSetName(CGSConnectionID cid, CGSSpace sid,
//                                   CFStringRef name);

// /// Get and set the affine transform of a space.
// CG_EXTERN CGAffineTransform CGSSpaceGetTransform(CGSConnectionID cid,
//                                                  CGSSpace space);
// CG_EXTERN void CGSSpaceSetTransform(CGSConnectionID cid, CGSSpace space,
//                                     CGAffineTransform transform);

// /// Gets and sets the region the space occupies.  You are responsible for
// /// releasing the region object.
// CG_EXTERN void CGSSpaceSetShape(CGSConnectionID cid, CGSSpace space,
//                                 CGSRegionRef shape);
// CG_EXTERN CGSRegionRef CGSSpaceCopyShape(CGSConnectionID cid, CGSSpace
// space);

// #pragma mark - Space Properties

// /// Copies and returns a region the space occupies.  You are responsible for
// /// releasing the region object.
// CG_EXTERN CGSRegionRef CGSSpaceCopyManagedShape(CGSConnectionID cid,
//                                                 CGSSpace sid);

// /// Gets the type of a space.
// CG_EXTERN CGSSpaceType CGSSpaceGetType(CGSConnectionID cid, CGSSpace sid);

// /// Gets the current space management mode.
// ///
// /// This method reflects whether the “Displays have separate Spaces” option
// is
// /// enabled in Mission Control system preference. You might use the return
// value
// /// to determine how to present your app when in fullscreen mode.
// CG_EXTERN CGSSpaceManagementMode CGSGetSpaceManagementMode(CGSConnectionID
// cid)
//     AVAILABLE_MAC_OS_X_VERSION_10_9_AND_LATER;

// /// Sets the current space management mode.
// CG_EXTERN CGError CGSSetSpaceManagementMode(CGSConnectionID cid,
//                                             CGSSpaceManagementMode mode)
//     AVAILABLE_MAC_OS_X_VERSION_10_9_AND_LATER;

// #pragma mark - Global Space Properties

// /// Gets the ID of the space currently visible to the user.
CG_EXTERN CGSSpace CGSGetActiveSpace(CGSConnectionID cid);
// CG_EXTERN CFStringRef CGSCopyManagedDisplayForSpace(CGSConnectionID cid,
// CGSSpace space);
extern CGSManagedDisplay
CGSCopyManagedDisplayForSpace(const CGSConnectionID cid, CGSSpace space);
// /// Returns an array of PIDs of applications that have ownership of a given
// /// space.
// CG_EXTERN CFArrayRef CGSSpaceCopyOwners(CGSConnectionID cid, CGSSpace sid);

/// Returns an array of all space IDs.
extern CFArrayRef CGSCopySpaces(CGSConnectionID cid, CGSSpaceMask mask);
CG_EXTERN CGSConnectionID CGSMainConnectionID(void);
CG_EXTERN CGSConnectionID _CGSDefaultConnection(void);

/// Given an array of window numbers, returns the IDs of the spaces those
/// windows lie on.
// CG_EXTERN CFArrayRef CGSCopySpacesForWindows(CGSConnectionID cid,
//                                              CGSSpaceMask mask,
//                                              CFArrayRef windowIDs);

// #pragma mark - Space-Local State

// /// Connection-local data in a given space.
// CG_EXTERN CFDictionaryRef CGSSpaceCopyValues(CGSConnectionID cid,
//                                              CGSSpace space);
// CG_EXTERN CGError CGSSpaceSetValues(CGSConnectionID cid, CGSSpace sid,
//                                     CFDictionaryRef values);
// CG_EXTERN CGError CGSSpaceRemoveValuesForKeys(CGSConnectionID cid,
//                                               CGSSpace sid,
//                                               CFArrayRef values);

// #pragma mark - Displaying Spaces

// /// Given an array of space IDs, each space is shown to the user.
CG_EXTERN void CGSShowSpaces(CGSConnectionID cid, CFArrayRef spaces);

// /// Given an array of space IDs, each space is hidden from the user.
// CG_EXTERN void CGSHideSpaces(CGSConnectionID cid, CFArrayRef spaces);

// /// Given an array of window numbers and an array of space IDs, adds each
// window
// /// to each space.
CG_EXTERN void CGSAddWindowsToSpaces(CGSConnectionID cid, CFArrayRef windows,
                                     CFArrayRef spaces);

// /// Given an array of window numbers and an array of space IDs, removes each
// /// window from each space.
CG_EXTERN void CGSRemoveWindowsFromSpaces(CGSConnectionID cid,
                                          CFArrayRef windows,
                                          CFArrayRef spaces);

// /// Changes the active space for a given display.
extern void CGSManagedDisplaySetCurrentSpace(const CGSConnectionID cid,
                                             CGSManagedDisplay display,
                                             CGSSpace space);
// extern void CGSManagedDisplaySetCurrentSpace(const CGSConnectionID cid,
// CFStringRef display, CGSSpace space);
