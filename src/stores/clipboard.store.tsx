import AsyncStorage from '@react-native-async-storage/async-storage'
import { solNative } from 'lib/SolNative'
import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { EmitterSubscription } from 'react-native'
import { IRootStore } from 'store'
import { Widget } from './ui.store'
import { storage } from './storage'

const MAX_ITEMS = 1000

let onTextCopiedListener: EmitterSubscription | undefined
let onFileCopiedListener: EmitterSubscription | undefined
let onImageCopiedListener: EmitterSubscription | undefined

export type ClipboardStore = ReturnType<typeof createClipboardStore>

export type PasteItem = {
  id: number
  text: string
  url?: string | null
  bundle?: string | null
  datetime: number // Unix timestamp when copied
  // Image support
  imagePath?: string | null
  thumbnailPath?: string | null
  thumbnailBase64?: string | null // Base64 data URL for thumbnail
}

export const createClipboardStore = (root: IRootStore) => {
  const store = makeAutoObservable({
    deleteItem: (index: number) => {
      if (index >= 0 && index < store.items.length) {
        store.items.splice(index, 1)
      }
    },
    deleteAllItems: () => {
      store.items = []
    },
    items: [] as PasteItem[],
    saveHistory: false,
    onFileCopied: (obj: { text: string; url: string; bundle: string | null }) => {
      const newItem: PasteItem = { id: +Date.now(), datetime: Date.now(), ...obj }

      // If save history move file to more permanent storage
      if (store.saveHistory) {
        // TODO!
      }

      store.items.unshift(newItem)
      store.removeLastItemIfNeeded()
    },
    onTextCopied: (obj: { text: string; bundle: string | null }) => {
      if (!obj.text) {
        return
      }

      const newItem: PasteItem = { id: Date.now().valueOf(), datetime: Date.now(), ...obj }

      const index = store.items.findIndex(t => t.text === newItem.text)
      // Item already exists, move to top
      if (index !== -1) {
        store.popToTop(index)
        return
      }

      store.items.unshift(newItem)
      store.removeLastItemIfNeeded()
    },
    onImageCopied: (obj: {
      imagePath: string
      thumbnailPath: string
      thumbnailBase64: string
      imageName: string
      bundle: string | null
    }) => {
      const newItem: PasteItem = {
        id: Date.now().valueOf(),
        datetime: Date.now(),
        text: obj.imageName || 'Image',
        imagePath: obj.imagePath,
        thumbnailPath: obj.thumbnailPath,
        thumbnailBase64: obj.thumbnailBase64,
        bundle: obj.bundle,
      }
      store.items.unshift(newItem)
      store.removeLastItemIfNeeded()
    },
    get clipboardItems(): PasteItem[] {
      if (!root.ui.query || root.ui.focusedWidget !== Widget.CLIPBOARD) {
        return store.items
      }

      // Clipboard history is capped at 1000 items.
      // We intentionally use simple substring matching (Array.filter + includes)
      // to match ripgrep/Raycast behavior and keep search semantics predictable.
      // MiniSearch was removed here because token-based search can't do true
      // substring matching, and indexed search is unnecessary at this scale.
      const query = root.ui.query.toLowerCase()
      return store.items.filter(item => item.text.toLowerCase().includes(query))
    },
    removeLastItemIfNeeded: () => {
      if (store.items.length > MAX_ITEMS) {
        store.items = store.items.slice(0, MAX_ITEMS)
      }
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
    cleanUp: () => {
      onTextCopiedListener?.remove()
      onTextCopiedListener = undefined
      onFileCopiedListener?.remove()
      onFileCopiedListener = undefined
      onImageCopiedListener?.remove()
      onImageCopiedListener = undefined
    },
  })

  onTextCopiedListener = solNative.addListener(
    'onTextCopied',
    store.onTextCopied,
  )
  // onFileCopiedListener = solNative.addListener(
  //   'onFileCopied',
  //   store.onFileCopied,
  // )
  onImageCopiedListener = solNative.addListener(
    'onImageCopied',
    store.onImageCopied,
  )

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
        // Ensure all items have datetime
        items = items.map((item: any) => ({
          ...item,
          datetime: typeof item.datetime === 'number' && !isNaN(item.datetime)
            ? item.datetime
            : (item.id || Date.now()), // fallback: use id or now
        }))
        runInAction(() => {
          store.items = items
        })
      }
    }
  }

  const persist = async () => {
    if (store.saveHistory) {
      // Ensure all items have datetime before persisting
      const itemsToPersist = store.items.map(item => ({
        ...item,
        datetime: typeof item.datetime === 'number' && !isNaN(item.datetime)
          ? item.datetime
          : (item.id || Date.now()),
      }))
      try {
        await solNative.securelyStore(
          '@sol.clipboard_history_v2',
          JSON.stringify(itemsToPersist),
        )
      } catch (e) {
        console.warn('Could not persist data', e)
      }
    }

    let storeWithoutItems = { ...store }
    storeWithoutItems.items = []

    try {
      await AsyncStorage.setItem(
        '@clipboard.store',
        JSON.stringify(storeWithoutItems),
      )
    } catch (e) {
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
