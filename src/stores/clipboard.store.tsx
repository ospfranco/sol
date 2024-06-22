import AsyncStorage from '@react-native-async-storage/async-storage'
import Fuse from 'fuse.js'
import {solNative} from 'lib/SolNative'
import {autorun, makeAutoObservable, runInAction, toJS} from 'mobx'
import {EmitterSubscription} from 'react-native'
import {IRootStore} from 'store'
import {Widget} from './ui.store'

const MAX_ITEMS = 1000

let onTextPastedListener: EmitterSubscription | undefined

export type ClipboardStore = ReturnType<typeof createClipboardStore>

type PasteItem = {
  text: string
  bundle?: string | null
}

export const FUSE_OPTIONS: Fuse.IFuseOptions<PasteItem> = {
  threshold: 0.15,
  ignoreLocation: true,
  findAllMatches: true,
  keys: ['text', 'bundle'],
}

export const createClipboardStore = (root: IRootStore) => {
  const store = makeAutoObservable({
    items: [] as PasteItem[],
    saveHistory: false,
    onTextPasted: (obj: {text: string; bundle: string | null}) => {
      if (!obj.text) {
        return
      }

      const alreadyExists = store.items.find(t => t.text === obj.text)

      if (alreadyExists) {
        return
      }

      if (store.items.length >= MAX_ITEMS) {
        store.items = store.items.slice(0, MAX_ITEMS)
      }

      store.items.unshift(obj)
    },
    get fusedItems(): Fuse<PasteItem> {
      let items = store.items
      return new Fuse(items, FUSE_OPTIONS)
    },
    get clipboardItems(): PasteItem[] {
      if (!root.ui.query || root.ui.focusedWidget !== Widget.CLIPBOARD) {
        return root.clipboard.items
      }

      let results = store.fusedItems.search(root.ui.query).map(r => r.item)

      return results
    },
    unshift: (index: number) => {
      const newItems = [...store.items]
      const item = newItems.splice(index, 1)
      newItems.unshift(item[0])
      store.items = newItems
    },
    setSaveHistory: (v: boolean) => {
      store.saveHistory = v
      if (!v) {
        solNative.securelyStore('@sol.clipboard_history', '[]')
      }
    },
  })

  onTextPastedListener = solNative.addListener(
    'onTextPasted',
    store.onTextPasted,
  )

  const hydrate = async () => {
    const state = await AsyncStorage.getItem('@clipboard.store')
    if (state) {
      const parsedStore = JSON.parse(state)
      store.saveHistory = parsedStore.saveHistory
    }

    if (store.saveHistory) {
      const entry = await solNative.securelyRetrieve('@sol.clipboard_history')
      if (entry) {
        const items = JSON.parse(entry)
        if (items.length > 0) {
          if (typeof items[0] === 'string') {
            store.items = items
              .slice(0, MAX_ITEMS)
              .map((t: string) => ({text: t, bundle: null}))
            return
          }
        }

        runInAction(() => {
          store.items = items
        })
      }
    }
  }

  const persist = async () => {
    if (store.saveHistory) {
      const history = toJS(store)
      try {
        await solNative.securelyStore(
          '@sol.clipboard_history',
          JSON.stringify(history.items),
        )
      } catch (e) {
        console.warn('Could not persist data', e)
      }
    }

    let storeWithoutItems = {...store}
    storeWithoutItems.items = []

    try {
      await AsyncStorage.setItem(
        '@clipboard.store',
        JSON.stringify(storeWithoutItems),
      )
    } catch (e) {
      console.warn('Could not persist clipboard store', e)
      await AsyncStorage.clear()
      await AsyncStorage.setItem(
        '@clipboard.store',
        JSON.stringify(storeWithoutItems),
      ).catch(e => console.warn('Could re-persist persist clipboard store', e))
    }
  }

  hydrate().then(() => {
    autorun(persist)
  })

  return store
}
