import EventKit

class StatusBarCalendarManager {
  static let shared = StatusBarCalendarManager()

  private var timer: Timer?
  private let calendarHelper = CalendarHelper()

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

    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else { return }

      let status = self.calendarHelper.getCalendarAuthorizationStatus()
      guard status == "authorized" else {
        DispatchQueue.main.async {
          StatusBarItemManager.shared.setStatusBarTitle("")
        }
        return
      }

      let events = self.calendarHelper.getEvents() ?? []
      let now = Date()
      let calendar = Calendar.current

      var upcomingEvent: EKEvent?

      for event in events {
        guard let ekEvent = event as? EKEvent else { continue }

        if ekEvent.isAllDay { continue }

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
          break
        }

        let isUpcoming = ekEvent.startDate >= now && calendar.isDateInToday(ekEvent.startDate)
        if isUpcoming {
          upcomingEvent = ekEvent
          break
        }
      }

      DispatchQueue.main.async {
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
}
