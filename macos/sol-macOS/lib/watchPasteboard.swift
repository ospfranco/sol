//
//  PasteboardWatcher.swift
//  macOS
//
//  Created by David Adler on 16/04/2022.
//

import Foundation
import CommonCrypto

extension Data{
    public func sha256() -> String{
        return hexStringFromData(input: digest(input: self as NSData))
    }
    
    private func digest(input : NSData) -> NSData {
        let digestLength = Int(CC_SHA256_DIGEST_LENGTH)
        var hash = [UInt8](repeating: 0, count: digestLength)
        CC_SHA256(input.bytes, UInt32(input.length), &hash)
        return NSData(bytes: hash, length: digestLength)
    }
    
    private  func hexStringFromData(input: NSData) -> String {
        var bytes = [UInt8](repeating: 0, count: input.length)
        input.getBytes(&bytes, length: input.length)
        
        var hexString = ""
        for byte in bytes {
            hexString += String(format:"%02x", UInt8(byte))
        }
        
        return hexString
    }
}

public extension String {
    func sha256() -> String{
        if let stringData = self.data(using: String.Encoding.utf8) {
            return stringData.sha256()
        }
        return ""
    }
}

func watchPasteboard(_ listener: @escaping (_ pasteboard:NSPasteboard) -> Void) {
  let pasteboard = NSPasteboard.general
  var changeCount = NSPasteboard.general.changeCount
  Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { _ in
    if pasteboard.changeCount != changeCount {
      listener(pasteboard)
      changeCount = pasteboard.changeCount
    }
  }
}

struct PasteboardWatcher {
  init() {
    watchPasteboard {
      print("copy detected : \($0)")
      let txt = $0.string(forType: .string)
      if txt != nil {
        handlePastedText(txt!, fileExtension: "txt")
      }
      let url = $0.string(forType: .URL)
      if url != nil {
        handlePastedText(url!, fileExtension: "url")
      }
      let html = $0.string(forType: .html)
      if html != nil {
        handlePastedText(html!, fileExtension: "html")
      }
    }
  }
}

struct ClipboardTextItem {
  let preview: String
  var itemDirectory: URL
  var fileExtension: String
  var hash: String
  var size: Int
  var timesCopied: Int
  var lastCopied: Date

  init(text: String, itemDirectory: URL, fileExtension: String, hash: String, timesCopied: Int, lastCopied: Date) {
    // Clip the text to a reasonable size for preview
    let preview = String(text.prefix(100))
    self.preview = preview
    self.itemDirectory = itemDirectory
    self.fileExtension = fileExtension
    self.hash = hash
    self.size = text.count
    self.timesCopied = timesCopied
    self.lastCopied = lastCopied
  }
  
  func saveMeta() {
    // Save the meta.json to the appropriate directory
    let meta = ItemMeta.init(fileExtension: fileExtension, hash: hash, size: size, timesCopied: timesCopied, lastCopied: lastCopied)
    let metaData = try! JSONEncoder().encode(meta)
    let metaFile = itemDirectory.appendingPathComponent("meta.json")
    try! FileManager.default.createDirectory(atPath: self.itemDirectory.path, withIntermediateDirectories: true, attributes: nil)
    try! metaData.write(to: metaFile, options: [])
  }
}

struct ItemMeta: Codable {
  var fileExtension: String
  var hash: String
  var size: Int
  var timesCopied: Int
  var lastCopied: Date
}

func handlePastedText(_ text: String, fileExtension: String) {
  let itemDirectory = getClipboardDirectory().appendingPathComponent("\(getTimestamp())")
  print("item000", itemDirectory.path)
  let itemFile = itemDirectory.appendingPathComponent("file.\(fileExtension)")
  let itemMeta = itemDirectory.appendingPathComponent("meta.json")
  
  // Create hash of text
  let hash = text.sha256()
  // Get the existing item or construct a new one
  let existingItem = clipboardHistory.getItem(hash: hash)
  var item: ClipboardTextItem = existingItem ?? ClipboardTextItem.init(text: text, itemDirectory: itemDirectory, fileExtension: fileExtension, hash: hash, timesCopied: 0, lastCopied: Date())
  // Increment the timesCopied and save it
  item.timesCopied += 1
  item.lastCopied = Date()
  item.saveMeta()

  if existingItem != nil {
    return
  }

  do {
    try text.write(to: itemFile, atomically: true, encoding: .utf8)
    // If the clipboard history size is greater than the history limit prune oldest items first
    
  } catch {
    print(error.localizedDescription)
  }

  
}



func getTimestamp() -> String {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withFullDate,
                             .withTime,
                             .withDashSeparatorInDate,
                             .withColonSeparatorInTime,
                             .withFractionalSeconds]
  return formatter.string(from: Date())
}

func getClipboardDirectory() -> URL {
  let solDirectory = Bundle.main.resourceURL!.appendingPathComponent("clipboard")
  // Check if the directory exists, if not create it
  let isDirectory =  UnsafeMutablePointer<ObjCBool>.allocate(capacity: 1)
  let fileExists = FileManager.default.fileExists(atPath: solDirectory.path, isDirectory: isDirectory)
  if !fileExists {
    try! FileManager.default.createDirectory(atPath: solDirectory.path, withIntermediateDirectories: true, attributes: nil)
  }
  
  // If it's not a directory delete the file and create a directory
  if !isDirectory.pointee.boolValue {
    try! FileManager.default.removeItem(at: solDirectory)
    try! FileManager.default.createDirectory(atPath: solDirectory.path, withIntermediateDirectories: true, attributes: nil)
  }
  
  // Deallocate pointer
  isDirectory.deallocate()
  
  return solDirectory
}

let clipboardHistory = ClipboardHistoryObservable()

enum ClipboardItem {
  case text(ClipboardTextItem)
}

class ClipboardHistoryObservable: ObservableObject {
  @Published var history: [ClipboardItem]
  
  init() {
    // Restore clipboard history from clipboard directory
    // First read the clipboard directory
    let directoryContents = try! FileManager.default.contentsOfDirectory(at: getClipboardDirectory(), includingPropertiesForKeys: [])
    
    var history: [ClipboardItem] = []
    // Then for each item read the meta.json

    
    self.history = history
  }
  
  func getItem(hash: String) -> ClipboardTextItem? {
    return nil
  }
}


