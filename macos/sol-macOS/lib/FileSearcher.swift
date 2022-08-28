import Foundation

let nf = NotificationCenter.default

@objc
class FileSearcher: NSObject {

//  public static let sharedInstance = FileSearcher()
  
  var query: NSMetadataQuery? {
    willSet {
      if let q = self.query {
        q.stop()
      }
    }
  }

  override init() {
    super.init();

    nf.addObserver(forName: .NSMetadataQueryDidUpdate, object: nil, queue: .main, using: {_ in

      var results: [Any] = []

      for result in self.query!.results {
        guard let item = result as? NSMetadataItem else {
          return
        }
        guard var pathURL = URL(string: item.value(forAttribute: NSMetadataItemPathKey) as! String) else {
          return
        }
        pathURL.deleteLastPathComponent()

        results.append([
          "filename": item.value(forAttribute: NSMetadataItemFSNameKey),
          "path": item.value(forAttribute: NSMetadataItemPathKey),
          "kind": item.value(forAttribute: NSMetadataItemKindKey),
          "location": pathURL.absoluteString
        ])

      }
      SolEmitter.sharedInstance.dispatch(name: "onFileSearch", body: results)
    })

//    nf.addObserver(forName: .NSMetadataQueryDidFinishGathering, object: nil, queue: .main, using: {_ in
//    })
  }


  @objc func searchFile(_ oq: String) {
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

