import EventKit

// Keep in sync with MEETING_PROVIDERS_URLS in src/lib/calendar.ts
private let meetingProviderURLs = [
  "https://us01web.zoom.us",
  "https://us02web.zoom.us",
  "https://us03web.zoom.us",
  "https://us04web.zoom.us",
  "https://us05web.zoom.us",
  "https://us06web.zoom.us",
  "https://meet.google.com",
  "https://meet.ffmuc.net",
  "https://meet.jit.si",
  "https://teams.microsoft.com",
]

struct UpcomingEventFilter {
  // nil means every calendar
  var calendarIds: [String]? = nil
  var excludeKeywords: [String] = []
  var requireMeetingLink = false
}

class StatusBarCalendarManager {
  static let shared = StatusBarCalendarManager()

  private var timer: Timer?
  private let calendarHelper = CalendarHelper()

  // Link of the event currently shown, sent along with status bar clicks
  private(set) var currentEventLink: String?

  var filter = UpcomingEventFilter() {
    didSet {
      updateStatusBar()
    }
  }

  var enabled: Bool = false {
    didSet {
      if enabled {
        startMonitoring()
      } else {
        stopMonitoring()
        StatusBarItemManager.shared.setStatusBarTitle("")
      }
    }
  }

  private func startMonitoring() {
    stopMonitoring()
    updateStatusBar()
    DispatchQueue.main.async { [weak self] in
      self?.timer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
        self?.updateStatusBar()
      }
    }
  }

  private func stopMonitoring() {
    DispatchQueue.main.async { [weak self] in
      self?.timer?.invalidate()
      self?.timer = nil
    }
  }

  private func updateStatusBar() {
    guard enabled else { return }
    let filter = self.filter

    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else { return }

      let status = self.calendarHelper.getCalendarAuthorizationStatus()
      guard status == "authorized" else {
        DispatchQueue.main.async {
          StatusBarItemManager.shared.setStatusBarTitle("")
        }
        return
      }

      if let calendarIds = filter.calendarIds, calendarIds.isEmpty {
        DispatchQueue.main.async {
          self.currentEventLink = nil
          StatusBarItemManager.shared.setStatusBarTitle("")
        }
        return
      }

      let events =
        self.calendarHelper.getEventsForCalendarIdentifiers(filter.calendarIds) ?? []
      let now = Date()
      let calendar = Calendar.current

      var upcomingEvent: EKEvent?
      var upcomingEventLink: String?

      for event in events {
        guard let ekEvent = event as? EKEvent else { continue }

        if ekEvent.isAllDay { continue }

        let lowercasedTitle = (ekEvent.title ?? "").lowercased()
        if filter.excludeKeywords.contains(where: { lowercasedTitle.contains($0) }) {
          continue
        }

        let link = Self.meetingLink(for: ekEvent)
        if filter.requireMeetingLink && link == nil { continue }

        // Skip declined events
        if ekEvent.hasAttendees {
          let declined = ekEvent.attendees?.contains { participant in
            participant.isCurrentUser && participant.participantStatus == .declined
          } ?? false
          if declined { continue }
        }

        let isOngoing = now >= ekEvent.startDate && now <= ekEvent.endDate
        if isOngoing {
          upcomingEvent = ekEvent
          upcomingEventLink = link
          break
        }

        let isUpcoming = ekEvent.startDate >= now && calendar.isDateInToday(ekEvent.startDate)
        if isUpcoming {
          upcomingEvent = ekEvent
          upcomingEventLink = link
          break
        }
      }

      DispatchQueue.main.async {
        self.currentEventLink = upcomingEventLink
        guard let event = upcomingEvent else {
          StatusBarItemManager.shared.setStatusBarTitle("")
          return
        }

        let rawTitle = (event.title ?? "").trimmingCharacters(in: .whitespaces)
        let truncated = String(rawTitle.prefix(18))
        let title = rawTitle.count > 18 ? truncated + "..." : truncated

        let minutesDiff = event.startDate.timeIntervalSince(now) / 60

        if minutesDiff <= 0 {
          StatusBarItemManager.shared.setStatusBarTitle(title)
          return
        }

        let hours = Int(minutesDiff) / 60
        let minutes = Int(minutesDiff) % 60
        let hoursStr = hours > 0 ? "\(hours)h" : ""
        let minutesStr = "\(minutes)m"

        StatusBarItemManager.shared.setStatusBarTitle("\(title) • \(hoursStr) \(minutesStr)")
      }
    }
  }

  // Mirrors extractMeetingLink in src/lib/calendar.ts, plus the event's own URL
  private static func meetingLink(for event: EKEvent) -> String? {
    if let url = event.url?.absoluteString, !url.isEmpty {
      return url
    }

    if let location = event.location, isWebURL(location) {
      return location
    }

    guard let notes = event.notes else { return nil }
    let tokens = notes
      .replacingOccurrences(of: "<", with: " ")
      .replacingOccurrences(of: ">", with: " ")
      .components(separatedBy: .whitespacesAndNewlines)
    return tokens.first { token in
      isWebURL(token) && meetingProviderURLs.contains { token.contains($0) }
    }
  }

  private static func isWebURL(_ text: String) -> Bool {
    guard let url = URL(string: text.trimmingCharacters(in: .whitespaces)),
      let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https",
      url.host != nil
    else { return false }
    return true
  }
}
