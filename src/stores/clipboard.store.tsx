import AsyncStorage from '@react-native-async-storage/async-storage'
import {solNative} from 'lib/SolNative'
import {autorun, makeAutoObservable, runInAction, toJS} from 'mobx'
import {EmitterSubscription} from 'react-native'
import {IRootStore} from 'store'
import {Widget} from './ui.store'
import MiniSearch from 'minisearch'
import {storage} from './storage'
import {captureException} from '@sentry/react-native'

const MAX_ITEMS = 1000

let onCopyListener: EmitterSubscription | undefined

export type ClipboardStore = ReturnType<typeof createClipboardStore>

type PasteItem = {
  id: number
  text: string
  bundle?: string | null
}

let minisearch = new MiniSearch({
  fields: ['text', 'bundle'],
  storeFields: ['text', 'bundle'],
  searchOptions: {
    boost: {text: 2},
    fuzzy: 0.2,
    prefix: true,
  },
})

export const createClipboardStore = (root: IRootStore) => {
  const store = makeAutoObservable({
    items: [] as PasteItem[],
    saveHistory: false,
    onTextCopied: (obj: {text: string; bundle: string | null}) => {
      if (!obj.text) {
        return
      }

      let newItem = {id: Date.now().valueOf(), ...obj}

      const index = store.items.findIndex(t => t.text === newItem.text)
      // Item already exists, move to top
      if (index !== -1) {
        // Re-add to minisearch to update the order
        minisearch.remove(store.items[index])
        minisearch.add(store.items[index])

        store.popToTop(index)
        return
      }

      // Item does not already exist, put to queue and add to minisearch
      store.items.unshift(newItem)
      minisearch.add(newItem)

      // Remove last item from minisearch
      if (store.items.length > MAX_ITEMS) {
        try {
          minisearch.remove(store.items[store.items.length - 1])
        } catch (e) {
          captureException(e)
        }

        store.items = store.items.slice(0, MAX_ITEMS)
      }
    },
    get clipboardItems(): PasteItem[] {
      if (!root.ui.query || root.ui.focusedWidget !== Widget.CLIPBOARD) {
        return root.clipboard.items
      }

      return minisearch.search(root.ui.query) as any
    },
    popToTop: (index: number) => {
      const newItems = [...store.items]
      const item = newItems.splice(index, 1)
      newItems.unshift(item[0])
      store.items = newItems
    },
    setSaveHistory: (v: boolean) => {
      store.saveHistory = v
      if (!v) {
        solNative.securelyStore('@sol.clipboard_history_v2', '[]')
      }
    },
  })

  onCopyListener = solNative.addListener('onTextCopied', store.onTextCopied)

  const hydrate = async () => {
    let state: string | null | undefined
    try {
      state = storage.getString('@clipboard.store')
    } catch {
      // intentionally left blank
    }
    if (!state) {
      state = await AsyncStorage.getItem('@clipboard.store')
    }

    if (state) {
      const parsedStore = JSON.parse(state)
      store.saveHistory = parsedStore.saveHistory
    }

    if (store.saveHistory) {
      const entry = await solNative.securelyRetrieve(
        '@sol.clipboard_history_v2',
      )

      if (entry) {
        let items = JSON.parse(entry)

        runInAction(() => {
          store.items = items
          minisearch.addAll(store.items)
        })
      }
    }
  }

  const persist = async () => {
    if (store.saveHistory) {
      const history = toJS(store)
      try {
        await solNative.securelyStore(
          '@sol.clipboard_history_v2',
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
