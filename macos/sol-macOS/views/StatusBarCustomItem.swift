import SwiftUI

func color(for status: CustomStatus) -> Color {
  switch status {
  case .green:
    return .green
  case .yellow:
    return .yellow
  case .red:
    return .red
  }
}

enum CustomStatus {
  case green, yellow, red
}

struct Item {
  let status: CustomStatus
  let text: String
  let url: URL
}

struct HighlightButton: View {
  let item: Item
  @State private var isHovered = false

  var body: some View {
    Button(action: {
      NSWorkspace.shared.open(item.url)
    }) {
      HStack {
        Circle()
          .fill(color(for: item.status))
          .frame(width: 10, height: 10)
        Text(item.text)
        Spacer()
      }
      .padding(5)
      .background(isHovered ? Color.gray.opacity(0.2) : Color.clear)
    }
    .frame(maxWidth: .infinity)
    .cornerRadius(5)
    .buttonStyle(PlainButtonStyle())
    .onHover { hovering in
      isHovered = hovering
    }
  }
}

struct StatusBarCustomItem: View {
  let items: [Item]

  var body: some View {
    VStack {
      if items.isEmpty {
        Text("No items to be shown")
      } else {
        List(items, id: \.text) { item in
          HighlightButton(item: item)
        }
        .scrollContentBackground(.hidden)
        .background(Color.clear)
      }
    }
    .edgesIgnoringSafeArea(.all)
    .background(
      VisualEffectBlur()
        .cornerRadius(15)
    )
    .frame(minWidth: 300, minHeight: 300)
    .fixedSize()
  }

}
