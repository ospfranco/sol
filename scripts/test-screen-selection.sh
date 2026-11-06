#!/bin/sh
# Native regression checks; requires macOS Command Line Tools, but no Pods/Xcode project build.
set -eu
cd "$(dirname "$0")/.."
TEST_DIR=$(mktemp -d "${TMPDIR:-/tmp}/sol-screen-selection.XXXXXX")
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

# Type-check the changed files against real AppKit/AX APIs. Only unrelated
# React/hotkey application services are stubbed for this standalone check.
cat > "$TEST_DIR/Bridging.h" <<'HEADER'
#import <Cocoa/Cocoa.h>
AXError _AXUIElementGetWindow(AXUIElementRef element, uint32_t *identifier);
HEADER
cat > "$TEST_DIR/AppServices.swift" <<'SWIFT'
import Cocoa
class AppDelegate: NSObject {}
final class HotKeyManager {
  final class HotKey { var isPaused = true }
  static let shared = HotKeyManager()
  let settingsHotKey = HotKey()
}
final class SolEmitter {
  static let sharedInstance = SolEmitter()
  func onShow(target: String?) {}
  func onHide() {}
}
SWIFT
swiftc -typecheck -import-objc-header "$TEST_DIR/Bridging.h" "$TEST_DIR/AppServices.swift" \
  macos/sol-macOS/lib/AccessibilityElement.swift macos/sol-macOS/lib/ScreenDetector.swift \
  macos/sol-macOS/managers/PanelManager.swift macos/sol-macOS/views/Panel.swift \
  macos/sol-macOS/lib/MouseUtils.swift
swiftc -o "$TEST_DIR/screen-selection-tests" \
  macos/sol-macOS/lib/ScreenDetector.swift macos/sol-macOS/managers/PanelManager.swift \
  tests/screen-selection/Stubs.swift tests/screen-selection/main.swift
"$TEST_DIR/screen-selection-tests"
