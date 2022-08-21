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

    nf.addObserver(forName: .NSMetadataQueryDidUpdate, object: nil, queue: .main, using: {_ in

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

//    nf.addObserver(forName: .NSMetadataQueryDidFinishGathering, object: nil, queue: .main, using: {_ in
//    })
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

