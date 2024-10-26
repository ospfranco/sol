import AsyncStorage from '@react-native-async-storage/async-storage'
import {solNative} from 'lib/SolNative'
import {autorun, makeAutoObservable, runInAction, toJS} from 'mobx'
import {EmitterSubscription} from 'react-native'
import {IRootStore} from 'store'
import {Widget} from './ui.store'
import MiniSearch from 'minisearch'

const MAX_ITEMS = 1000

let onTextPastedListener: EmitterSubscription | undefined

export type ClipboardStore = ReturnType<typeof createClipboardStore>

type PasteItem = {
  id: number
  text: string
  bundle?: string | null
}

let id = 0

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
    onTextPasted: (obj: {text: string; bundle: string | null}) => {
      if (!obj.text) {
        return
      }

      const alreadyExists = store.items.find(t => t.text === obj.text)

      if (alreadyExists) {
        return
      }

      if (store.items.length >= MAX_ITEMS) {
        try {
          minisearch.remove(store.items[store.items.length - 1])
        } catch (e) {
          console.warn('Could not remove item from minisearch', e)
        }
        store.items = store.items.slice(0, MAX_ITEMS)
      }

      store.items.unshift({id, ...obj})
      minisearch.add({id, obj})
      id++
    },
    get clipboardItems(): PasteItem[] {
      if (!root.ui.query || root.ui.focusedWidget !== Widget.CLIPBOARD) {
        return root.clipboard.items
      }

      return minisearch.search(root.ui.query) as any
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
        let items = JSON.parse(entry)

        items = items.map((item: PasteItem) => ({
          ...item,
          id: id++,
        }))

        minisearch.addAll(items)
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
