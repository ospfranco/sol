interface INativeEvent {
  id: string
  title?: string
  url?: string
  date: string
  endDate: string
  isAllDay: boolean
  notes: string
  color: string
  location: string
  status: number // 0 none, 1 confirmed, 2 tentative, 3 cancelled
}

declare module '*.png' {
  const value: import('react-native').ImageSourcePropType
  export default value
}

declare module '*.jpeg' {
  const value: import('react-native').ImageSourcePropType
  export default value
}

type CalendarAuthorizationStatus =
  | 'notDetermined'
  | 'restricted'
  | 'denied'
  | 'authorized'

declare var global: {
  __SolProxy: {
    setHeight: (height: number) => void
    resetWindowSize: () => void
    hideWindow: () => void
    searchFiles: (query: string) => void
    requestCalendarAccess: () => Promise<void>
    getCalendarAuthorizationStatus: () => CalendarAuthorizationStatus
    getEvents: () => INativeEvent[]
  }
}
