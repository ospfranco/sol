#import <Foundation/Foundation.h>

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <err.h>
#include <string.h>
#include <unistd.h>
#include <sysexits.h>
#include <getopt.h>
#include <sys/attr.h>
#include <sys/param.h>
#include <sys/attr.h>
#include <sys/vnode.h>
#include <sys/fsgetpath.h>
#include <sys/mount.h>
#include <string>
#include "FileSearch.h"
#include <iostream>

struct packed_name_attr {
    u_int32_t               size;           // Of the remaining fields
    struct attrreference    ref;            // Offset/length of name itself
    char                    name[PATH_MAX];
};

struct packed_attr_ref {
    u_int32_t               size;           // Of the remaining fields
    struct attrreference    ref;            // Offset/length of attr itself
};

struct packed_result {
    u_int32_t           size;               // Including size field itself
    struct fsid         fs_id;
    struct fsobj_id     obj_id;
};
typedef struct packed_result packed_result;
typedef struct packed_result *packed_result_p;

static NSUInteger limit = 0;

#define MAX_MATCHES         20
#define MAX_EBUSY_RETRIES   5


//BOOL filter_result(const char *path, const char *match_string) {
//    if (!caseSensitive && !startMatchOnly && !endMatchOnly) {
//        return NO;
//    }
//    
//    NSString *pathStr = @(path);
//    NSString *matchStr = @(match_string);
//    
//    if (caseSensitive) {
//        NSString *escMatch = [NSRegularExpression escapedTemplateForString:matchStr];
//        NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:escMatch
//                                                                               options:0
//                                                                                 error:nil];
//        NSTextCheckingResult *res = [regex firstMatchInString:pathStr
//                                                      options:0
//                                                        range:NSMakeRange(0, [pathStr length])];
//        if (res == nil) {
//            return YES;
//        }
//    }
//    
//    if (!exactMatchOnly) {
//        if (startMatchOnly) {
//            if (![[pathStr lastPathComponent] hasPrefix:matchStr]) {
//                return YES;
//            }
//        }
//        if (endMatchOnly) {
//            if (![[pathStr lastPathComponent] hasSuffix:matchStr]) {
//                return YES;
//            }
//        }
//    }
//    return NO;
//}

//static BOOL vol_supports_searchfs(NSString *path) {
//    
//    struct vol_attr_buf {
//        u_int32_t               size;
//        vol_capabilities_attr_t vol_capabilities;
//    } __attribute__((aligned(4), packed));
//    
//    const char *p = [path cStringUsingEncoding:NSUTF8StringEncoding];
//    
//    struct attrlist attrList;
//    memset(&attrList, 0, sizeof(attrList));
//    attrList.bitmapcount = ATTR_BIT_MAP_COUNT;
//    attrList.volattr = (ATTR_VOL_INFO | ATTR_VOL_CAPABILITIES);
//    
//    struct vol_attr_buf attrBuf;
//    memset(&attrBuf, 0, sizeof(attrBuf));
//    
//    int err = getattrlist(p, &attrList, &attrBuf, sizeof(attrBuf), 0);
//    if (err != 0) {
//        err = errno;
//        fprintf(stderr, "Error %d getting attrs for volume %s\n", err, p);
//        return NO;
//    }
//    
//    assert(attrBuf.size == sizeof(attrBuf));
//        
//    if ((attrBuf.vol_capabilities.valid[VOL_CAPABILITIES_INTERFACES] & VOL_CAP_INT_SEARCHFS) == VOL_CAP_INT_SEARCHFS) {
//        if ((attrBuf.vol_capabilities.capabilities[VOL_CAPABILITIES_INTERFACES] & VOL_CAP_INT_SEARCHFS) == VOL_CAP_INT_SEARCHFS) {
//            return YES;
//        }
//    }
//    
//    return NO;
//}


void do_searchfs_search(const char *match_string) {
  
  std::string volpath = "/Users/osp/Dropbox (Maestral)/";

  // See "man 2 searchfs" for further details
      int                     err = 0;
      int                     items_found = 0;
      int                     ebusy_count = 0;
      unsigned long           matches;
      unsigned int            search_options;
      struct fssearchblock    search_blk;
      struct attrlist         return_list;
      struct searchstate      search_state;
      struct packed_name_attr info1;
      struct packed_attr_ref  info2;
      packed_result           result_buffer[MAX_MATCHES];
      
  catalog_changed:
      items_found = 0; // Set this here in case we're completely restarting
      search_blk.searchattrs.bitmapcount = ATTR_BIT_MAP_COUNT;
      search_blk.searchattrs.reserved = 0;
      search_blk.searchattrs.commonattr = ATTR_CMN_NAME;
      search_blk.searchattrs.volattr = 0;
      search_blk.searchattrs.dirattr = 0;
      search_blk.searchattrs.fileattr = 0;
      search_blk.searchattrs.forkattr = 0;
      
      // Set up the attributes we want for all returned matches.
      search_blk.returnattrs = &return_list;
      return_list.bitmapcount = ATTR_BIT_MAP_COUNT;
      return_list.reserved = 0;
      return_list.commonattr = ATTR_CMN_FSID | ATTR_CMN_OBJID;
      return_list.volattr = 0;
      return_list.dirattr = 0;
      return_list.fileattr = 0;
      return_list.forkattr = 0;

      // Allocate a buffer for returned matches
      search_blk.returnbuffer = result_buffer;
      search_blk.returnbuffersize = sizeof(result_buffer);
      
      // Pack the searchparams1 into a buffer
      // NOTE: A name appears only in searchparams1
      strcpy(info1.name, match_string);
      info1.ref.attr_dataoffset = sizeof(struct attrreference);
      info1.ref.attr_length = (u_int32_t)strlen(info1.name) + 1;
      info1.size = sizeof(struct attrreference) + info1.ref.attr_length;
      search_blk.searchparams1 = &info1;
      search_blk.sizeofsearchparams1 = info1.size + sizeof(u_int32_t);
      
      // Pack the searchparams2 into a buffer
      info2.size = sizeof(struct attrreference);
      info2.ref.attr_dataoffset = sizeof(struct attrreference);
      info2.ref.attr_length = 0;
      search_blk.searchparams2 = &info2;
      search_blk.sizeofsearchparams2 = sizeof(info2);
      
      // Maximum number of matches we want
      search_blk.maxmatches = MAX_MATCHES;
      
      // Maximum time to search, per call
      search_blk.timelimit.tv_sec = 1;
      search_blk.timelimit.tv_usec = 0;
      
      // Configure search options
      search_options = SRCHFS_START;
      
//      if (!dirsOnly) {
          search_options |= SRCHFS_MATCHFILES;
//      }
//      
//      if (!filesOnly) {
          search_options |= SRCHFS_MATCHDIRS;
//      }
//      
//      if (!exactMatchOnly) {
          search_options |= SRCHFS_MATCHPARTIALNAMES;
//      }
//      
//      if (skipPackages) {
          search_options |= SRCHFS_SKIPPACKAGES;
//      }
//      
//      if (skipInvisibles) {
//          search_options |= SRCHFS_SKIPINVISIBLE;
//      }
//      
//      if (skipInappropriate) {
//          search_options |= SRCHFS_SKIPINAPPROPRIATE;
//      }
//      
//      if (negateParams) {
//          search_options |= SRCHFS_NEGATEPARAMS;
//      }
      
      unsigned int match_cnt = 0;

      // Start searching
      do {
          err = searchfs(volpath.c_str(), &search_blk, &matches, 0, search_options, &search_state);
          if (err == -1) {
              err = errno;
          }
          
          if ((err == 0 || err == EAGAIN) && matches > 0) {
              
              // Unpack the results
              char *ptr = (char *)&result_buffer[0];
              char *end_ptr = (ptr + sizeof(result_buffer));
              
              for (int i = 0; i < matches; ++i) {
                  packed_result_p result_p = (packed_result_p)ptr;
                  items_found++;
                  
                  // Call private SPI fsgetpath to get path string for file system object ID
                  char path_buf[PATH_MAX];
                  ssize_t size = fsgetpath((char *)&path_buf,
                                                  sizeof(path_buf),
                                                  &result_p->fs_id,
                                                  (uint64_t)result_p->obj_id.fid_objno |
                                                  ((uint64_t)result_p->obj_id.fid_generation << 32));
                  if (size > -1) {
//                      if (strlen(match_string) > 0 && !filter_result(path_buf, match_string)) {
                        if (strlen(match_string) > 0) {
                          fprintf(stdout, "%s\n", path_buf);
                          match_cnt++;
                          if (limit && match_cnt >= limit) {
                              return;
                          }
                      }
                  } else {
                      // Getting path failed. This may be because the file system object
                      // was deleted in the interval between being found and path lookup.
                      // Fail silently.
  //                    fprintf(stderr, "Unable to get path for object ID: %d\n", result_p->obj_id.fid_objno);
                  }
                  
                  ptr = (ptr + result_p->size);
                  if (ptr > end_ptr) {
                      break;
                  }
              }
              
          }
          
          // EBUSY indicates catalog change; retry a few times.
          if ((err == EBUSY) && (ebusy_count++ < MAX_EBUSY_RETRIES)) {
            std::cout << "EBUSY, trying again" << std::endl;
              goto catalog_changed;
          }
          
          if (err != 0 && err != EAGAIN) {
            std::cout << "searchfs() function failed with error:: " << err << " and error: " << strerror(err) << std::endl;
          }
          
          search_options &= ~SRCHFS_START;

      } while (err == EAGAIN);
  
}

