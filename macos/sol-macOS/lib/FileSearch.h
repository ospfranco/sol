#ifndef FileSearch_h
#define FileSearch_h

#include <vector>
#include <string>

static const int MAX_SEARCH_DEPTH = 5;
static const size_t MAX_SEARCH_RESULTS = 200;

struct File {
  std::string path;
  bool is_folder;
  std::string name;
};

std::vector<File> search_files(NSString *basePath, NSString *query, int depth = 0, size_t *result_count = nullptr);

#endif /* FileSearch_h */
