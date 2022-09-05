import {FUSE_OPTIONS} from 'config'
import Fuse from 'fuse.js'
import {solNative} from 'lib/SolNative'
import {makeAutoObservable} from 'mobx'
import {EmitterSubscription} from 'react-native'
import {IRootStore} from 'store'
import {Widget} from './ui.store'

let onTextPastedListener: EmitterSubscription | undefined

export const createClipboardStore = (root: IRootStore) => {
  const store = makeAutoObservable({
    items: [] as string[],
    onTextPasted: (obj: {text: string}) => {
      const newItems = store.items.filter(t => t !== obj.text)

      if (newItems.length >= 20) {
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
  })

  onTextPastedListener = solNative.addListener(
    'onTextPasted',
    store.onTextPasted,
  )

  return store
}
