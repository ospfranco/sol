import Foundation
import EventKit

class CalendarHelper {
  public static let sharedInstance = CalendarHelper()
  private let dateFormatter = ISO8601DateFormatter()

  func requestCalendarAccess(_ callback: @escaping () -> Void) {
    let store = EKEventStore()
    let eventAuthorizationStatus = EKEventStore.authorizationStatus(for: .event)
    if eventAuthorizationStatus == .notDetermined {
      store.requestAccess(to: .event) { granted, error in
        print("Event kit request access response, granted: \(granted), error: \(String(describing: error))")
        callback()
      }
    }
  }

  func getNextEvents(_ query: String?) -> Any? {
    let store = EKEventStore()
    let eventAuthorizationStatus = EKEventStore.authorizationStatus(for: .event)
    if eventAuthorizationStatus != .authorized {
      return []
    }

    let calendars = store.calendars(for: .event)

    let now = Date()
    let aWeekFromNow = Date(timeIntervalSinceNow: query != nil ?  6 * 7 * 24 * 3600 : 7*24*3600)
    let predicate = store.predicateForEvents(withStart: now, end: aWeekFromNow, calendars: calendars)
    let events = store.events(matching: predicate)

    return events.map { event -> Any in
      return [
        "title": event.title,
        "url": event.url?.absoluteString,
        "notes": event.notes,
        "location": event.location,
        "color": event.calendar.color.hexString,
        "date": event.startDate != nil ? dateFormatter.string(from: event.startDate) : nil,
        "endDate": event.endDate != nil ? dateFormatter.string(from: event.endDate) : nil,
        "isAllDay": event.isAllDay,
        "status": event.status.rawValue, // 0 none, 1 confirmed, 2 tentative, 3 cancelled
        "attendeesLength": event.attendees?.count ?? 0
      ]
    }
  }

  func getCalendarAuthorizationStatus() -> String {
    let eventAuthorizationStatus = EKEventStore.authorizationStatus(for: .event)
    switch eventAuthorizationStatus {
    case .notDetermined:
      return "notDetermined"
    case .restricted:
      return "restricted"
    case .denied:
      return "denied"
    case .authorized:
      return "authorized"
    default:
      return "notDeterminded"
    }
  }
}
