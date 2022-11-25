import Foundation
import SwiftUI

struct ToastView: View {
  var text: String
  var body: some View {
    Text(text)
      .padding(EdgeInsets(top: 15, leading: 20, bottom: 15, trailing: 20))
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .fixedSize()
  }
}
