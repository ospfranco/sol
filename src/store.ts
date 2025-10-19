import { createContext, useContext } from 'react'
import { CalendarStore, createCalendarStore } from 'stores/calendar.store'
import { ClipboardStore, createClipboardStore } from 'stores/clipboard.store'
import { createKeystrokeStore, KeystrokeStore } from 'stores/keystroke.store'
import { createUIStore, UIStore } from './stores/ui.store'
import { ProcessesStore, createProcessesStore } from 'stores/processes.store'
import { EmojiStore, createEmojiStore } from 'stores/emoji.store'
import { ScriptsStore, createScriptsStore } from 'stores/scripts.store'

export interface IRootStore {
  ui: UIStore
  clipboard: ClipboardStore
  keystroke: KeystrokeStore
  calendar: CalendarStore
  processes: ProcessesStore
  emoji: EmojiStore
  scripts: ScriptsStore
  cleanUp: () => void
}

let createRootStore = (): IRootStore => {
  let store: any = {}

  store.ui = createUIStore(store)
  store.clipboard = createClipboardStore(store)
  store.keystroke = createKeystrokeStore(store)
  store.calendar = createCalendarStore(store)
  store.processes = createProcessesStore(store)
  store.scripts = createScriptsStore(store)
  store.emoji = createEmojiStore(store)
    ; (store as IRootStore).cleanUp = () => {
      store.ui.cleanUp()
      store.calendar.cleanUp()
      store.keystroke.cleanUp()
      store.clipboard.cleanUp()
    }

  return store
}

export let root = createRootStore()

// @ts-expect-error hot is RN
module.hot?.dispose(() => {
  root.cleanUp()
})

export let StoreContext = createContext<IRootStore>(root)
export let StoreProvider = StoreContext.Provider
export let useStore = () => useContext(StoreContext)
