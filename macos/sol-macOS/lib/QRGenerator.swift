import Foundation
import Cocoa

func QR(from string: String, size len:CGFloat) -> NSImage? {
    let data = string.data(using: String.Encoding.ascii)
    if let filter = CIFilter(name: "CIQRCodeGenerator") {
        filter.setValue(data, forKey: "inputMessage")
        let trans = CGAffineTransform(scaleX: len, y: len)
        if let output = filter.outputImage?.transformed(by: trans) {
            let rep = NSCIImageRep(ciImage: output)
            let img = NSImage(size: rep.size)
            img.addRepresentation(rep)
            return img
        }
    }
    return nil
}

func WifiQR(name ssid: String, password code: String, size: CGFloat = 10) -> NSImage? {
    return QR(from: "WIFI:T:WPA;S:\(ssid);P:\(code);;", size: size)
}
