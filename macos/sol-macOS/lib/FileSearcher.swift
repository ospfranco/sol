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
    print("Setting observer")
    nf.addObserver(forName: .NSMetadataQueryDidStartGathering, object: nil, queue: .main, using: {_ in

      print("Query did start gathering")
    })

    nf.addObserver(forName: .NSMetadataQueryDidUpdate, object: nil, queue: .main, using: {_ in

      print("QUery results updated \(self.query?.resultCount)")
    })
    nf.addObserver(forName: .NSMetadataQueryDidFinishGathering, object: nil, queue: .main, using: {_ in
      print("Got results \(self.query?.results)")
    })
  }


  func searchFile(_ oq: String) {
    print("Searching \(oq)")
    query = NSMetadataQuery()
//    let predicate = NSPredicate(format: "%K ==[cd] %@", NSMetadataItemFSNameKey ,oq)
    let predicate = NSPredicate(format: "%K == %@", NSMetadataItemFSNameKey ,oq)
    query?.searchScopes = [NSMetadataQueryIndexedLocalComputerScope]
    query?.predicate = predicate
    query?.start()
  }
}

