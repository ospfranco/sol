import {createContext, useContext} from 'react'
import {createUIStore} from './stores'

export interface IRootStore {
  ui: ReturnType<typeof createUIStore>
}

let createRootStore = (): IRootStore => {
  let store: any = {}

  store.ui = createUIStore(store)

  return store
}

export let root = createRootStore()

export let StoreContext = createContext<IRootStore>(root)
export let StoreProvider = StoreContext.Provider
export let useStore = () => useContext(StoreContext)
