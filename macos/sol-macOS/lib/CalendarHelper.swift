import Foundation
import EventKit

class CalendarHelper {
  
  public static var sharedInstance = CalendarHelper()
  private var store = EKEventStore()
  private var dateFormatter = ISO8601DateFormatter()
  
  init() {
    let eventAuthorizationStatus = EKEventStore.authorizationStatus(for: .event)
    if eventAuthorizationStatus == .notDetermined {
      let store = EKEventStore()
      store.requestAccess(to: .event) { granted, error in
          print("Event kit request access response")
      }
    }
  }
  
  func getNextEvents() -> Any? {
    
    let eventAuthorizationStatus = EKEventStore.authorizationStatus(for: .event)
    if(eventAuthorizationStatus != .authorized) {
      return []
    }
      
    let calendars = store.calendars(for: .event)
    
    let now = Date()
    let tomorrow = Date(timeIntervalSinceNow: 3*24*3600)
    let predicate = store.predicateForEvents(withStart: now, end: tomorrow, calendars: calendars)
    let events = store.events(matching: predicate)
    
    return events.map { event -> Any in
      
      let color = event.calendar.color
      let hexColor = String(format: "#%02X%02X%02X", (Int) (color!.redComponent * 0xFF), (Int) (color!.greenComponent * 0xFF),
                            (Int) (color!.blueComponent * 0xFF))
      
      return [
        "title": event.title,
        "url": event.url?.absoluteString,
        "notes": event.notes,
        "location": event.location,
        "color": hexColor,
        "date": event.startDate != nil ? dateFormatter.string(from: event.startDate) : nil,
        "endDate": event.endDate != nil ? dateFormatter.string(from: event.endDate) : nil,
        "isAllDay": event.isAllDay
      ]
    }
  }
}
