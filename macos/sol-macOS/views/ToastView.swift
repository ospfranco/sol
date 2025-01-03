import Foundation
import SwiftUI

enum ToastVariant {
  case success
  case error
  case none
}

struct VisualEffectBlur: NSViewRepresentable {
  var tintColor: NSColor?

  func makeNSView(context: Context) -> NSVisualEffectView {
    let view = NSVisualEffectView()
    view.blendingMode = .behindWindow
    view.material = .hudWindow
    view.state = .active

    if let tintColor = tintColor {
      let tintOverlay = NSView()
      tintOverlay.wantsLayer = true
      tintOverlay.layer?.backgroundColor = tintColor.withAlphaComponent(0.2).cgColor  // Adjust alpha for subtle effect
      tintOverlay.frame = view.bounds
      tintOverlay.autoresizingMask = [.width, .height]
      view.addSubview(tintOverlay)
    }

    return view
  }

  func updateNSView(_ nsView: NSVisualEffectView, context: Context) {}
}

struct ToastView: View {
  var text: String
  var variant: ToastVariant
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
        if image == nil {
          if variant == .success {
            Circle()
              .fill(Color.green)
              .frame(width: 10, height: 10)
          } else if variant == .error {
            Circle()
              .fill(Color.red)
              .frame(width: 10, height: 10)
          }
        }
        Text(text)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
          .multilineTextAlignment(.center)
      }
    }
    .padding(EdgeInsets(top: 10, leading: 15, bottom: 10, trailing: 15))
    .background(
      VisualEffectBlur()
        .cornerRadius(10)
    )
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
