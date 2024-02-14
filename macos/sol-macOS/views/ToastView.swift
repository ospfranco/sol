import Foundation
import SwiftUI

struct ToastView: View {
  var text: String
  var body: some View {
    VStack {
      Text(text)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
      .padding(EdgeInsets(top: 0, leading: 15, bottom: 0, trailing: 15))
      .edgesIgnoringSafeArea(.all)
      .frame(minWidth:120, minHeight: 20)
      .fixedSize()
      .onTapGesture {
        DispatchQueue.main.async {
          let appDelegate = NSApp.delegate as? AppDelegate
          appDelegate?.dismissToast()
        }
      }
  }
}
