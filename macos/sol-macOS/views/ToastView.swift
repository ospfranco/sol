import Foundation
import SwiftUI

struct ToastView: View {
  var text: String
  var body: some View {
    VStack {
      Text(text)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
      .padding(EdgeInsets(top: 0, leading: 20, bottom: 0, trailing: 20))
      .edgesIgnoringSafeArea(.all)
      .frame(minWidth:200, minHeight: 30)
      .fixedSize()
  }
}
