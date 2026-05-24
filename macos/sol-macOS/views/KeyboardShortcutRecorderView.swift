import Cocoa

class KeyboardShortcutRecorderView: NSView {
  private let instructionLabel = NSTextField(labelWithString: "Enter Key Combination")
  private let valueLabel = NSTextField(labelWithString: "waiting...")
  private var isRecording = false
  private let recorder = KeyboardShortcutRecorder()

  // Add the callback properties
  @objc var onShortcutChange: RCTBubblingEventBlock?
  @objc var onCancel: RCTBubblingEventBlock?

  override init(frame frameRect: NSRect) {
    super.init(frame: frameRect)
    setupView()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
  }

  private func displayText(for keys: [String]) -> String {
    return keys.map { key in
      switch key {
      case "command":
        return "⌘"
      case "shift":
        return "⇧"
      case "option":
        return "⌥"
      case "control":
        return "⌃"
      default:
        return key
      }
    }.joined(separator: " ")
  }

  private func setupView() {
    wantsLayer = true
    layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
    layer?.cornerRadius = 10
    layer?.shadowColor = NSColor.black.cgColor
    layer?.shadowOpacity = 0.08
    layer?.shadowRadius = 4
    layer?.shadowOffset = CGSize(width: 0, height: 2)

    instructionLabel.alignment = .center
    instructionLabel.font = NSFont.boldSystemFont(ofSize: 13)
    instructionLabel.translatesAutoresizingMaskIntoConstraints = false
    addSubview(instructionLabel)

    valueLabel.alignment = .center
    valueLabel.font = NSFont.monospacedSystemFont(ofSize: 13, weight: .medium)
    valueLabel.textColor = NSColor.labelColor
    valueLabel.backgroundColor = NSColor.controlBackgroundColor
    valueLabel.wantsLayer = true
    valueLabel.translatesAutoresizingMaskIntoConstraints = false
    valueLabel.drawsBackground = true
    addSubview(valueLabel)

    NSLayoutConstraint.activate([
      instructionLabel.topAnchor.constraint(equalTo: topAnchor, constant: 18),
      instructionLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 18),
      instructionLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -18),

      valueLabel.topAnchor.constraint(equalTo: instructionLabel.bottomAnchor, constant: 10),
      valueLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 18),
      valueLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -18),
      valueLabel.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -18),
    ])

    recorder.onShortcut = { [weak self] keys in
      self?.valueLabel.stringValue = self?.displayText(for: keys) ?? ""
      if let onShortcutChange = self?.onShortcutChange {
        onShortcutChange([
          "shortcut": keys
        ])
      }
    }

    recorder.onCancel = { [weak self] in
      self?.valueLabel.stringValue = "Press your Hotkey..."
      if let onCancel = self?.onCancel {
        onCancel([:])
      }
    }

    startRecording()
  }

  deinit {
    recorder.stopRecording()
  }

  override func removeFromSuperview() {
    // Stop recording when view is removed from hierarchy
    recorder.stopRecording()
    super.removeFromSuperview()
  }

  private func startRecording() {
    isRecording = true
    valueLabel.stringValue = "Press your Hotkey..."
    recorder.startRecording()
  }

}

@objc(KeyboardShortcutRecorderViewManager)
class KeyboardShortcutRecorderViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> NSView! {
    return KeyboardShortcutRecorderView()
  }

}
