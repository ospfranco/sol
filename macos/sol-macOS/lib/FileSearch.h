#ifndef FileSearch_h
#define FileSearch_h

#include <vector>
#include <string>

static const size_t MAX_SEARCH_RESULTS = 200;

enum SearchMode {
  SEARCH_MODE_FUZZY = 0,
  SEARCH_MODE_PATH = 1,
  SEARCH_MODE_REGEX = 2,
};

struct File {
  std::string path;
  bool is_folder;
  std::string name;
  float score;
};

std::vector<File> search_files(
  NSString *basePath, NSString *query,
  SearchMode mode = SEARCH_MODE_FUZZY);

#endif /* FileSearch_h */
