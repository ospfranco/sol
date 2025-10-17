import Cocoa

class KeyboardShortcutRecorderView: NSView {
  private let textField = NSTextField(labelWithString: "Click to record shortcut")
  private var isRecording = false
  private let recorder = KeyboardShortcutRecorder()

  // Add the callback property
  @objc var onShortcutChange: RCTBubblingEventBlock?

  override init(frame frameRect: NSRect) {
    super.init(frame: frameRect)
    setupView()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
  }

  private func setupView() {
    wantsLayer = true
    layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
    layer?.cornerRadius = 6

    textField.alignment = .center
    textField.translatesAutoresizingMaskIntoConstraints = false
    addSubview(textField)

    NSLayoutConstraint.activate([
      textField.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 8),
      textField.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -8),
      textField.centerYAnchor.constraint(equalTo: centerYAnchor),
    ])

    //    let clickGesture = NSClickGestureRecognizer(target: self, action: #selector(toggleRecording))
    //    addGestureRecognizer(clickGesture)

    recorder.onShortcut = { [weak self] keys in
      self?.textField.stringValue = keys.joined(separator: " + ")
      //      self?.stopRecording()
      // Call the callback with the shortcut
      if let onShortcutChange = self?.onShortcutChange {
        onShortcutChange([
          "shortcut": keys
        ])
      }
    }

    startRecording()
  }

  deinit {
    // CRITICAL: Stop recording when view is deallocated
    recorder.stopRecording()
  }

  override func removeFromSuperview() {
    // Stop recording when view is removed from hierarchy
    recorder.stopRecording()
    super.removeFromSuperview()
  }

  private func startRecording() {
    isRecording = true
    textField.stringValue = "Recording..."
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
