import Foundation

let nf = NotificationCenter.default

@objc
class FileSearcher: NSObject {

  var query: NSMetadataQuery?

  override init() {
    super.init();
    
//    nf.addObserver(Any, selector: <#T##Selector#>, name: <#T##NSNotification.Name?#>, object: <#T##Any?#>)

//    nf.addObserver(forName: .NSMetadataQueryDidUpdate, object: self.query, queue: .main, using: {_ in
//      var results: [Any] = []
//
//
//      if(self.query != nil) {
//        for result in self.query!.results {
//          guard let item = result as? NSMetadataItem else {
//            return
//          }
//
//          guard var pathURL = URL(string: item.value(forAttribute: NSMetadataItemPathKey) as! String) else {
//            return
//          }
//
//          pathURL.deleteLastPathComponent()
//
//          results.append([
//            "filename": item.value(forAttribute: NSMetadataItemFSNameKey),
//            "path": item.value(forAttribute: NSMetadataItemPathKey),
//            "kind": item.value(forAttribute: NSMetadataItemKindKey),
//            "location": pathURL.absoluteString
//          ])
//        }
//
//        SolEmitter.sharedInstance.dispatch(name: "onFileSearch", body: results)
//        self.query?.stop()
//      }
//    })
  }


  @objc func searchFile(_ oq: String) {
//    guard !oq.isEmpty else {
//      return
//    }
//    
//    query = NSMetadataQuery()
//    
//    let predicate = NSPredicate(format: "%K CONTAINS[cd] %@", NSMetadataItemDisplayNameKey, oq)
//    query?.searchScopes = [NSMetadataQueryIndexedLocalComputerScope]
//    query?.predicate = predicate
//  
//    DispatchQueue.main.async {
//      self.query?.start()
//    }
  }
  
}

