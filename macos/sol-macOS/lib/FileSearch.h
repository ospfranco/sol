#ifndef FileSearch_h
#define FileSearch_h

#include <vector>
#include <string>

#define MAX_SEARCH_DEPTH 10
#define MAX_SEARCH_RESULTS 500

struct File {
  std::string path;
  bool is_folder;
  std::string name;
};

std::vector<File> search_files(NSString *basePath, NSString *query, int depth, int *result_count);

#endif /* FileSearch_h */
