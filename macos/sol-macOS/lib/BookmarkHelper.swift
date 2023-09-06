import Foundation

@objc
class BookmarkHelper:NSObject {
    
  static func requestFullDiskAccess() {
    NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles")!)
  }
  
  static func hasFullDiskAccess() -> Bool {
    do {
      let homeUrl = try FileManager.default.url(for: .libraryDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
      let file = homeUrl.appendingPathComponent("/Safari/Bookmarks.plist")
      
      if file.startAccessingSecurityScopedResource() {
        return NSDictionary(contentsOf: file) != nil
      } else {
        return false
      }
    } catch {
      return false
    }
  }
  
  static func getSafariBookmars() -> [[String: String]]? {
    do {
      let homeUrl = try FileManager.default.url(for: .libraryDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
      let file = homeUrl.appendingPathComponent("/Safari/Bookmarks.plist")
      
      if file.startAccessingSecurityScopedResource() {
        if let plist = NSDictionary(contentsOf: file) {
          return extractBookmarksFrom(dict: plist)
        } else {
          return nil
        }
      } else {
        return nil
      }
    } catch {
      return nil
    }
  }
  
  static func extractBookmarksFrom(dict: NSDictionary) -> [[String: String]] {
      if let children: [NSDictionary] = dict["Children"] as! [NSDictionary]? {
        return (children.map(extractBookmarksFrom).flatMap{$0}.filter { !$0.isEmpty })
      } else if let url: String = dict["URLString"] as! String? {
          let uriDictionary = (dict["URIDictionary"] as! NSDictionary?)!
          let title = (uriDictionary["title"] as! String?)!

        return [["title": title, "url": url]]
      } else {
        return [[:]]
      }
  }
}
