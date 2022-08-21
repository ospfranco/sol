import Foundation

let nf = NotificationCenter.default

class FileSearcher {

  public static let sharedInstance = FileSearcher()
  
  var query: NSMetadataQuery? {
    willSet {
      if let q = self.query {
        q.stop()
      }
    }
  }

  init() {
//    print("Setting observer")
//    nf.addObserver(forName: .NSMetadataQueryDidStartGathering, object: nil, queue: .main, using: {_ in
//
//      print("1 gathering")
//    })
//
    nf.addObserver(forName: .NSMetadataQueryDidUpdate, object: nil, queue: .main, using: {_ in
//      print("2 updated: \(self.query?.results)")
//      let results = self.query!.results.map {
//        let item = $0 as NSMetadataItem
//        return [
//          "name": item.
//        ]
//      }

      var results: [Any] = []

      for result in self.query!.results {
        guard let item = result as? NSMetadataItem else {
          return
        }
        results.append([
          "filename": item.value(forAttribute: NSMetadataItemFSNameKey),
          "path": item.value(forAttribute: NSMetadataItemPathKey),
          "kind": item.value(forAttribute: NSMetadataItemKindKey)
        ])

      }
      SolEmitter.sharedInstance.dispatch(name: "onFileSearch", body: results)
    })

    nf.addObserver(forName: .NSMetadataQueryDidFinishGathering, object: nil, queue: .main, using: {_ in
//      let files = self.query!.results.map {
//        return [
//          name: $0.
//        ]
//      }
//      print("result count", self.query!.resultCount)
//      let results = self.query!.results
//      SolEmitter.sharedInstance.dispatch(name: "onFileSearch", body: self.query!.results)
    })


  }


  func searchFile(_ oq: String) {
    if(!oq.isEmpty) {
      query = NSMetadataQuery()
      let predicate = NSPredicate(format: "%K ==[cd] %@", NSMetadataItemFSNameKey, oq)
      query?.searchScopes = [NSMetadataQueryIndexedLocalComputerScope]
      query?.predicate = predicate
      DispatchQueue.main.async {
        self.query?.start()
      }
    }

  }
}

