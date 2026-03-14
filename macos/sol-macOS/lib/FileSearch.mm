#import <Foundation/Foundation.h>
#include "FileSearch.h"
#include "NSString+Score.h"

static NSString *findFdBinary() {
  NSFileManager *fm = [NSFileManager defaultManager];
  NSArray *candidates = @[
    @"/opt/homebrew/bin/fd",
    @"/usr/local/bin/fd",
    @"/usr/bin/fd"
  ];
  for (NSString *path in candidates) {
    if ([fm fileExistsAtPath:path]) return path;
  }
  return nil;
}

static NSString *buildFuzzyRegex(NSString *query) {
  NSMutableString *regex = [NSMutableString string];
  for (NSUInteger i = 0; i < [query length]; i++) {
    if (i > 0) [regex appendString:@".*"];
    unichar c = [query characterAtIndex:i];
    NSString *charStr = [NSString stringWithCharacters:&c length:1];
    [regex appendString:[NSRegularExpression escapedPatternForString:charStr]];
  }
  return regex;
}

std::vector<File> search_files(NSString *basePath, NSString *query,
                               SearchMode mode) {
  std::vector<File> files;

  if (!query || [query length] == 0) return files;

  NSString *fdPath = findFdBinary();
  if (!fdPath) {
    NSLog(@"[FileSearch] fd binary not found");
    return files;
  }
  NSLog(@"[FileSearch] Using fd at: %@", fdPath);

  NSMutableArray *args = [NSMutableArray array];

  // Common flags
  [args addObjectsFromArray:@[
    @"--color", @"never",
    @"--exclude", @"node_modules",
    @"--exclude", @"Library",
    @"--exclude", @"__pycache__",
    @"--exclude", @"Pods",
    @"--exclude", @"build",
    @"--exclude", @"DerivedData",
    @"--exclude", @"*.app",
    @"--exclude", @"*.framework",
    @"--max-results", @"500"
  ]];

  switch (mode) {
    case SEARCH_MODE_FUZZY: {
      NSString *fuzzyRegex = buildFuzzyRegex(query);
      [args addObjectsFromArray:@[@"-i", fuzzyRegex]];
      break;
    }
    case SEARCH_MODE_PATH: {
      NSString *fuzzyRegex = buildFuzzyRegex(query);
      [args addObjectsFromArray:@[@"-i", @"-p", fuzzyRegex]];
      break;
    }
    case SEARCH_MODE_REGEX: {
      [args addObjectsFromArray:@[@"-i", @"-p", query]];
      break;
    }
  }

  // Search directory
  [args addObject:basePath];

  NSLog(@"[FileSearch] Running: %@ %@", fdPath, [args componentsJoinedByString:@" "]);

  NSTask *task = [[NSTask alloc] init];
  NSPipe *pipe = [[NSPipe alloc] init];
  NSPipe *errorPipe = [[NSPipe alloc] init];

  [task setLaunchPath:fdPath];
  [task setArguments:args];
  [task setStandardOutput:pipe];
  [task setStandardError:errorPipe];

  @try {
    [task launch];
  } @catch (NSException *e) {
    NSLog(@"[FileSearch] Failed to launch fd: %@", e);
    return files;
  }

  NSData *data = [[pipe fileHandleForReading] readDataToEndOfFile];
  [task waitUntilExit];

  int exitCode = [task terminationStatus];
  NSData *errData = [[errorPipe fileHandleForReading] readDataToEndOfFile];
  NSString *errOutput = [[NSString alloc] initWithData:errData encoding:NSUTF8StringEncoding];
  if (errOutput && [errOutput length] > 0) {
    NSLog(@"[FileSearch] fd stderr: %@", errOutput);
  }
  NSLog(@"[FileSearch] fd exit code: %d, output bytes: %lu", exitCode, (unsigned long)[data length]);

  NSString *output = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  if (!output || [output length] == 0) return files;

  NSArray *lines = [output componentsSeparatedByString:@"\n"];
  NSFileManager *fm = [NSFileManager defaultManager];

  for (NSString *line in lines) {
    if ([line length] == 0) continue;

    BOOL isDir = NO;
    [fm fileExistsAtPath:line isDirectory:&isDir];

    NSString *filename = [line lastPathComponent];

    float score = 1.0;
    switch (mode) {
      case SEARCH_MODE_FUZZY: {
        score = [filename scoreAgainst:query];
        break;
      }
      case SEARCH_MODE_PATH: {
        NSString *relativePath = line;
        if (basePath && [line hasPrefix:basePath]) {
          relativePath = [line substringFromIndex:[basePath length]];
          if ([relativePath hasPrefix:@"/"]) {
            relativePath = [relativePath substringFromIndex:1];
          }
        }
        score = [relativePath scoreAgainst:query];
        break;
      }
      case SEARCH_MODE_REGEX: {
        score = 1.0;
        break;
      }
    }

    // Skip files that don't meaningfully match the query
    if (mode != SEARCH_MODE_REGEX && score < 0.01) continue;

    files.push_back({
      .path = std::string([line UTF8String]),
      .is_folder = static_cast<bool>(isDir),
      .name = std::string([filename UTF8String]),
      .score = score
    });
  }

  return files;
}
