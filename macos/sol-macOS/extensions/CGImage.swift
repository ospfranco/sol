import CoreGraphics

extension CGImage {
  func crop(toSize targetSize: CGSize) -> CGImage? {
    let x = floor(CGFloat(self.width) / 2 - targetSize.width / 2)
    let y = floor(CGFloat(self.height) / 2 - targetSize.height / 2)
    let frame = CGRect(x: x, y: y, width: targetSize.width, height: targetSize.height)
    
    return self.cropping(to: frame)
  }
}
