import {createContext, useContext} from 'react'
import {createClipboardStore} from 'stores/clipboard.store'
import {createUIStore} from './stores/ui.store'

export interface IRootStore {
  ui: ReturnType<typeof createUIStore>
  clipboard: ReturnType<typeof createClipboardStore>
}

let createRootStore = (): IRootStore => {
  let store: any = {}

  store.ui = createUIStore(store)
  store.clipboard = createClipboardStore(store)

  return store
}

export let root = createRootStore()

export let StoreContext = createContext<IRootStore>(root)
export let StoreProvider = StoreContext.Provider
export let useStore = () => useContext(StoreContext)
