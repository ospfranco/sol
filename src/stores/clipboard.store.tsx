import AsyncStorage from '@react-native-async-storage/async-storage'
import {FUSE_OPTIONS} from 'config'
import Fuse from 'fuse.js'
import {solNative} from 'lib/SolNative'
import {autorun, makeAutoObservable, runInAction, toJS} from 'mobx'
import {EmitterSubscription} from 'react-native'
import {IRootStore} from 'store'
import {Widget} from './ui.store'

let onTextPastedListener: EmitterSubscription | undefined

export const createClipboardStore = (root: IRootStore) => {
  const store = makeAutoObservable({
    items: [] as string[],
    saveHistory: false,
    onTextPasted: (obj: {text: string}) => {
      const newItems = store.items.filter(t => t !== obj.text)

      if (newItems.length >= 100) {
        newItems.pop()
      }

      newItems.unshift(obj.text)
      store.items = newItems
    },
    get clipboardItems(): string[] {
      if (!root.ui.query || root.ui.focusedWidget !== Widget.CLIPBOARD) {
        return root.clipboard.items
      }

      let results = new Fuse(root.clipboard.items, FUSE_OPTIONS)
        .search(root.ui.query)
        .map(r => r.item)
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

    AsyncStorage.setItem('@clipboard.store', JSON.stringify(store))
  }

  hydrate().then(() => {
    autorun(persist)
  })

  return store
}
