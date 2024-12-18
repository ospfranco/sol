import Foundation
import SwiftUI

enum Variant {
  case success
  case error
}

struct ToastView: View {
  var text: String
  var variant: Variant
  var image: NSImage?

  var body: some View {
    VStack {
      if let image = image {
        Image(nsImage: image)
          .resizable()
          .aspectRatio(contentMode: .fit)
          .frame(width: 400, height: 400)
          .padding(10)
      }
      HStack {
        if variant == .success {
          Circle()
            .fill(Color.green)
            .frame(width: 10, height: 10)
        } else if variant == .error {
          Circle()
            .fill(Color.red)
            .frame(width: 10, height: 10)
        }
        Text(text)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
    }
    .padding(EdgeInsets(top: 10, leading: 15, bottom: 10, trailing: 15))
    .edgesIgnoringSafeArea(.all)
    .frame(minWidth: 120, minHeight: 10)
    .fixedSize()
    .onTapGesture {
      DispatchQueue.main.async {
        let appDelegate = NSApp.delegate as? AppDelegate
        appDelegate?.dismissToast()
      }
    }
  }
}
