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
#include "FileSearch.h"
#include "NSString+Score.h"

std::vector<File> search_files(NSString *basePath, NSString *query) {
  std::vector<File> files;
  NSFileManager *defFM = [NSFileManager defaultManager];
  NSError *error = nil;
  NSArray *dirPath = [defFM contentsOfDirectoryAtPath:basePath error:&error];
  for(NSString *path in dirPath) {
    BOOL is_dir;
    NSString *full_path = [basePath stringByAppendingPathComponent:path];
    std::string cpp_full_path = [full_path UTF8String];
    float distance = [path scoreAgainst:query];
    
     if([defFM fileExistsAtPath:full_path isDirectory:&is_dir] && is_dir){  
      if (distance > 0.5) {
        files.push_back({
          .path = cpp_full_path,
          .is_folder = true,
          .name = [path UTF8String]
        });
      }

       std::vector<File> sub_files = search_files(full_path, query);
       files.insert(files.end(), sub_files.begin(), sub_files.end());
     } else {
       
       if (distance > 0.5) {
        files.push_back({
          .path = cpp_full_path,
          .is_folder = false,
          .name = [path UTF8String]
        });
      }
     }
  }
  
   return files;
}

