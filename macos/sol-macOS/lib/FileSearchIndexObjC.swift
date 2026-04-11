import Foundation
import SQLite3

@objc public class FileSearchIndexObjC: NSObject {
  @objc static let shared = FileSearchIndexObjC()

  private let index = FileSearchIndex.shared
  private let indexer = FileSearchIndexer.shared

  @objc(searchFilesWithQuery:)
  func searchFiles(query: String) -> [[String: Any]] {
    let results = index.searchFiles(query: query)
    return results.map { file in
      [
        "path": file.path,
        "name": file.name,
        "is_folder": file.is_folder
      ]
    }
  }

  @objc(indexPathsWith:)
  func indexPaths(paths: [String]) {
    // Stop any existing watcher before re-indexing
    indexer.stopWatching()
    index.indexPaths(paths)
    // Start watching after indexing kicks off
    indexer.startWatching(paths: paths)
  }

  @objc func hasIndexedContent() -> Bool {
    return index.hasIndexedContent()
  }

  @objc(startWatchingPaths:)
  func startWatching(paths: [String]) {
    indexer.startWatching(paths: paths)
  }

  @objc(removeIndexedPath:)
  func removeIndexedPath(_ path: String) {
    index.removeIndexedPath(path)
    // Restart watcher with updated paths (handled by JS calling indexPaths again)
  }

  @objc func clearIndex() {
    indexer.stopWatching()
    index.clearIndex()
  }
}
