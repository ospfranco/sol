#ifndef FileSearch_h
#define FileSearch_h

#include <vector>
#include <string>

struct File {
  std::string path;
  bool is_folder;
  std::string name;
};

std::vector<File> search_files(NSString *basePath, NSString *query);

#endif /* FileSearch_h */
