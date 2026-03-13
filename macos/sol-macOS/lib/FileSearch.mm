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

static NSSet *skippedDirectories = nil;

static NSSet *getSkippedDirectories() {
  if (!skippedDirectories) {
    skippedDirectories = [NSSet setWithObjects:
      @"node_modules", @".git", @"Library", @".cache",
      @".Trash", @"__pycache__", @".npm", @".yarn",
      @"Pods", @"build", @"DerivedData", nil];
  }
  return skippedDirectories;
}

static bool shouldSkipDirectory(NSString *name) {
  if ([name hasPrefix:@"."]) return true;
  if ([name hasSuffix:@".app"]) return true;
  if ([name hasSuffix:@".framework"]) return true;
  if ([getSkippedDirectories() containsObject:name]) return true;
  return false;
}

std::vector<File> search_files(NSString *basePath, NSString *query, int depth, size_t *result_count) {
  std::vector<File> files;

  size_t localCount = 0;
  if (!result_count) {
    result_count = &localCount;
  }

  if (depth >= MAX_SEARCH_DEPTH || *result_count >= MAX_SEARCH_RESULTS) {
    return files;
  }

  NSFileManager *defFM = [NSFileManager defaultManager];
  NSError *error = nil;
  NSArray *dirPath = [defFM contentsOfDirectoryAtPath:basePath error:&error];
  if (!dirPath) {
    return files;
  }

  for(NSString *path in dirPath) {
    if (*result_count >= MAX_SEARCH_RESULTS) {
      break;
    }

    BOOL is_dir;
    NSString *full_path = [basePath stringByAppendingPathComponent:path];
    std::string cpp_full_path = [full_path UTF8String];
    float distance = [path scoreAgainst:query];

    if([defFM fileExistsAtPath:full_path isDirectory:&is_dir] && is_dir) {
      if (shouldSkipDirectory(path)) {
        continue;
      }

      if (distance > 0.5) {
        files.push_back({
          .path = cpp_full_path,
          .is_folder = true,
          .name = [path UTF8String]
        });
        (*result_count)++;
      }

      std::vector<File> sub_files = search_files(full_path, query, depth + 1, result_count);
      files.insert(files.end(), sub_files.begin(), sub_files.end());
    } else {
      if (distance > 0.5) {
        files.push_back({
          .path = cpp_full_path,
          .is_folder = false,
          .name = [path UTF8String]
        });
        (*result_count)++;
      }
    }
  }

  return files;
}

