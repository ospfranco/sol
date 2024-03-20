/// <reference types="nativewind/types" />

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
  eventStatus: number // 0 none, 1 confirmed, 2 tentative, 3 cancelled
  status: number // 0 none, 1 confirmed, 2 tentative, 3 cancelled
  declined: boolean
  eventLink?: string | null // Computed
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
    // searchFiles: (query: string) => void
    requestCalendarAccess: () => Promise<void>
    getCalendarAuthorizationStatus: () => CalendarAuthorizationStatus
    getEvents: () => INativeEvent[]
    ls: (path: string) => string[]
    exists: (path: string) => boolean
    readFile: (path: string) => string
    userName: () => string
    ps: () => string
    killProcess: (pid: string) => void
    getWifiPassword: () => string | null
    getWifiInfo: () => {ip: string | undefined}
  }
}

interface Notification {
  title: string | undefined
  text: string | undefined
  app: string | undefined
  url: string | undefined
  date: number
  iden: string | undefined
  subt: string | undefined
}

interface IPeriod {
  id: number
  start: number
  end?: number
}

interface FileDescription {
  filename: string
  path: string
  kind: string
  location: string
}

interface ITrackingProject {
  id: string
  name: string
  periods: IPeriod[]
}

interface Item {
  icon?: string
  iconImage?: ImageURISource | number | ImageURISource[]
  IconComponent?: FC<any>
  color?: string
  url?: string
  preventClose?: boolean
  type: ItemType
  name: string
  alias?: string
  subName?: string
  callback?: () => void
  metaCallback?: () => void
  isApplescript?: boolean
  text?: string
  shortcut?: string
  isFavorite?: boolean // injected in UI array
  isRunning?: boolean // only apps have this
}

type OnboardingStep =
  | 'v1_start'
  | 'v1_shortcut'
  | 'v1_quick_actions'
  | 'v1_skipped'
  | 'v1_completed'
