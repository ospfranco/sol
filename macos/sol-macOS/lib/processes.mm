//#include "processes.h"
//#import <sys/sysctl.h>
//
//NSArray* allProcesses(){
//  static int maxArgumentSize = 0;
//  if (maxArgumentSize == 0) {
//    size_t size = sizeof(maxArgumentSize);
//    if (sysctl((int[]){ CTL_KERN, KERN_ARGMAX }, 2, &maxArgumentSize, &size, NULL, 0) == -1) {
//      perror("sysctl argument size");
//      maxArgumentSize = 4096; // Default
//    }
//  }
//  NSMutableArray *processes = [NSMutableArray array];
//  int mib[3] = { CTL_KERN, KERN_PROC, KERN_PROC_ALL};
//  struct kinfo_proc *info;
//  size_t length;
//  int count;
//  
//  if (sysctl(mib, 3, NULL, &length, NULL, 0) < 0)
//    return nil;
//  if (!(info = malloc(length)))
//    return nil;
//  if (sysctl(mib, 3, info, &length, NULL, 0) < 0) {
//    free(info);
//    return nil;
//  }
//  count = length / sizeof(struct kinfo_proc);
//  for (int i = 0; i < count; i++) {
//    pid_t pid = info[i].kp_proc.p_pid;
//    if (pid == 0) {
//      continue;
//    }
//    size_t size = maxArgumentSize;
//    char* buffer = (char *)malloc(length);
//    if (sysctl((int[]){ CTL_KERN, KERN_PROCARGS2, pid }, 3, buffer, &size, NULL, 0) == 0) {
//      NSString* executable = [NSString stringWithCString:(buffer+sizeof(int)) encoding:NSUTF8StringEncoding];
//      [processes addObject:[NSDictionary dictionaryWithObjectsAndKeys:
//                  [NSNumber numberWithInt:pid], @"pid",
//                  executable, @"executable",
//                  nil]];
//    }
//    free(buffer);
//  }
//  
//  free(info);
//  
//  return processes;
//}
//
//BOOL processIsRunning(NSString* executableName, NSArray* processes){
//  if (!processes) {
//    processes = allProcesses();
//  }
//  BOOL searchIsPath = [executableName isAbsolutePath];
//  NSEnumerator* processEnumerator = [processes objectEnumerator];
//  NSDictionary* process;
//  while ((process = (NSDictionary*)[processEnumerator nextObject])) {
//    NSString* executable = [process objectForKey:@"executable"];
//    if ([(searchIsPath ? executable : [executable lastPathComponent]) isEqual:executableName]) {
//      return YES;
//    }
//  }
//  return NO;
//}
