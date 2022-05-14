import {solNative} from 'lib/SolNative'
import {makeAutoObservable} from 'mobx'
import {EmitterSubscription} from 'react-native'
import {IRootStore} from 'store'

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
