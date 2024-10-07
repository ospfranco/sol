import AsyncStorage from '@react-native-async-storage/async-storage'
import {autorun, makeAutoObservable, runInAction, toJS} from 'mobx'
import {IRootStore} from 'store'
import {emojis as rawEmojis_} from '../lib/emojis'
import {solNative} from 'lib/SolNative'
import MiniSearch from 'minisearch'

let rawEmojis = rawEmojis_.map((emoji: any, idx) => ({id: idx, ...emoji}))

export interface Emoji {
  emoji: string
  description: string
  category: string
  aliases: string[]
  tags: string[]
}

let minisearch = new MiniSearch({
  fields: ['description', 'category', 'aliases'],
  storeFields: ['emoji'],
  searchOptions: {
    prefix: true,
  },
})

minisearch.addAll(rawEmojis)

export const EMOJI_ROW_SIZE = 7

function groupEmojis(emojis: Emoji[]): Array<Emoji[]> {
  const emojisArray: Array<Emoji[]> = []

  for (let i = 0; i < emojis.length; i += EMOJI_ROW_SIZE) {
    emojisArray.push(emojis.slice(i, i + EMOJI_ROW_SIZE))
  }

  return emojisArray
}

export type EmojiStore = ReturnType<typeof createEmojiStore>

export const createEmojiStore = (root: IRootStore) => {
  let persist = async () => {
    let plainState = toJS(store)
    try {
      await AsyncStorage.setItem('@emoji.store', JSON.stringify(plainState))
    } catch (error) {
      console.error('Error saving emoji store', error)
      await AsyncStorage.clear()
      await AsyncStorage.setItem(
        '@emoji.store',
        JSON.stringify(plainState),
      ).catch(e => console.warn('Could re-persist persist emoji store', e))
    }
  }

  let hydrate = async () => {
    const storeState = await AsyncStorage.getItem('@emoji.store')

    if (storeState) {
      let parsedStore = JSON.parse(storeState)

      runInAction(() => {
        store.frequentlyUsedEmojis = parsedStore.frequentlyUsedEmojis
          ? (Object.fromEntries(
              Object.entries(parsedStore.frequentlyUsedEmojis).slice(
                0,
                EMOJI_ROW_SIZE,
              ),
            ) as any)
          : {}
      })
    }
  }

  let store = makeAutoObservable({
    //    ____  _                              _     _
    //   / __ \| |                            | |   | |
    //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
    //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
    //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
    //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
    frequentlyUsedEmojis: {} as Record<string, number>,
    //    _____                            _           _
    //   / ____|                          | |         | |
    //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
    //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
    //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
    //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
    //                        | |
    //                        |_|
    get emojis(): Emoji[][] {
      const query = root.ui.query
      let searchResults = query
        ? groupEmojis(minisearch.search(query) as any)
        : groupEmojis(rawEmojis)

      // TODO move these from UI Store here
      let favorites = Object.entries(store.frequentlyUsedEmojis)
      if (!root.ui.query && favorites.length) {
        const mappedFavorites = favorites
          .sort(([_, frequency1], [_2, frequency2]) => frequency2 - frequency1)
          .map(entry => ({
            emoji: entry[0],
            description: '',
            category: '',
            aliases: [],
            tags: [],
          }))

        for (let i = mappedFavorites.length; i < EMOJI_ROW_SIZE; i++) {
          mappedFavorites.push({
            emoji: '',
            description: '',
            category: '',
            aliases: [],
            tags: [],
          })
        }

        return [mappedFavorites, ...searchResults]
      } else {
        return searchResults
      }
    },
    insert(index: number) {
      const favorites = Object.entries(store.frequentlyUsedEmojis).sort(
        ([_, freq1], [_2, freq2]) => freq2 - freq1,
      )

      const query = root.ui.query

      const data = !!query ? minisearch.search(query) : rawEmojis

      let emojiChar = data[index].emoji
      if (favorites.length && !query) {
        if (index < EMOJI_ROW_SIZE) {
          emojiChar = favorites[index]?.[0]
          if (!emojiChar) {
            return
          }
        } else {
          emojiChar = data[index - EMOJI_ROW_SIZE].emoji
        }
      }

      if (store.frequentlyUsedEmojis[emojiChar]) {
        store.frequentlyUsedEmojis[emojiChar] += 1
      } else {
        if (favorites.length === EMOJI_ROW_SIZE) {
          let leastUsed = favorites[0]
          favorites.forEach(([emoji, frequency]) => {
            if (frequency < leastUsed[1]) {
              leastUsed = [emoji, frequency]
            }
          })

          delete store.frequentlyUsedEmojis[leastUsed[0]]

          store.frequentlyUsedEmojis[emojiChar] = 1
        } else {
          store.frequentlyUsedEmojis[emojiChar] = 1
        }
      }

      solNative.insertToFrontmostApp(emojiChar)
    },
  })

  hydrate().then(() => {
    autorun(persist)
  })

  return store
}
