import Foundation
import Sentry

class TelemetryManager {
  static let shared = TelemetryManager()
  var isEnabled: Bool = true

  private init() {}

  func captureError(_ error: Error) {
    guard isEnabled else { return }
    SentrySDK.capture(error: error)
  }

  func addBreadcrumb(_ breadcrumb: Breadcrumb) {
    guard isEnabled else { return }
    SentrySDK.addBreadcrumb(breadcrumb)
  }
}
