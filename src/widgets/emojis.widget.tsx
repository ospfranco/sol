import clsx from 'clsx'
import {LoadingBar} from 'components/LoadingBar'
import {StyledFlatList} from 'components/StyledFlatList'
import {useFullSize} from 'hooks/useFullSize'
import {Emoji, emojiFuse, emojis, EMOJIS_PER_ROW, groupEmojis} from 'lib/emoji'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import colors from 'tailwindcss/colors'

interface Props {
  style?: ViewStyle
}

const ROW_HEIGHT = 72

export const EmojisWidget: FC<Props> = observer(({style}) => {
  useFullSize()
  const store = useStore()
  const query = store.ui.query
  const selectedIndex = store.ui.selectedIndex
  const storeRowIndex = Math.floor(selectedIndex / EMOJIS_PER_ROW)
  const storeSubIndex = selectedIndex % EMOJIS_PER_ROW
  const listRef = useRef<FlatList | null>(null)
  const colorScheme = useColorScheme()

  useEffect(() => {
    solNative.turnOnHorizontalArrowsListeners()
    return () => {
      solNative.turnOffHorizontalArrowsListeners()
    }
  }, [])

  let data = !!query
    ? groupEmojis(emojiFuse.search(query).map(r => r.item))
    : emojis

  useEffect(() => {
    if (data.length) {
      listRef.current?.scrollToIndex({
        index: storeRowIndex,
        viewOffset: 80,
      })
    }
  }, [storeRowIndex])

  const favorites = Object.entries(store.ui.frequentlyUsedEmojis)
  if (favorites.length && !query) {
    const mappedFavorites = favorites
      .sort(([_, frequency1], [_2, frequency2]) => frequency2 - frequency1)
      .map(entry => ({
        emoji: entry[0],
        description: '',
        category: '',
        aliases: [],
        tags: [],
      }))

    for (let i = mappedFavorites.length; i < EMOJIS_PER_ROW; i++) {
      mappedFavorites.push({
        emoji: '',
        description: '',
        category: '',
        aliases: [],
        tags: [],
      })
    }

    data = [mappedFavorites, ...data]
  }

  return (
    <View className="flex-1" style={style}>
      <View className="py-4 px-3 justify-center">
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          placeholderTextColor={colors.neutral[500]}
          placeholder="Search emojis..."
          className="text-lg"
          selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
        />
      </View>
      <LoadingBar />
      <StyledFlatList
        ref={listRef}
        className="-mr-2"
        contentContainerStyle="flex-grow-1 p-3"
        data={data}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="dark:text-gray-400 text-gray-500 text-sm">
              No emoji found
            </Text>
          </View>
        }
        getItemLayout={(_, index) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
          index,
        })}
        windowSize={1}
        keyExtractor={(_, index) => index.toString()}
        // @ts-ignore
        renderItem={({
          item: emojiRow,
          index: rowIndex,
        }: {
          item: Emoji[]
          index: number
        }) => {
          let res = []
          for (let i = 0; i < emojiRow.length; i++) {
            const isSelected = i === storeSubIndex && rowIndex === storeRowIndex
            const emoji = emojiRow[i]
            res.push(
              <TouchableOpacity
                onPress={() => {
                  store.ui.insertEmojiAt(rowIndex * EMOJIS_PER_ROW + i)
                }}
                className={clsx(
                  `items-center justify-center rounded-t p-3.5 border-b-2 border-transparent`,
                  {
                    'bg-lightHighlight dark:bg-darkHighlight border-black dark:border-white':
                      isSelected,
                  },
                )}
                key={`${emoji.emoji}-${i}_${rowIndex}`}>
                <Text className="text-4xl">{emoji.emoji}</Text>
              </TouchableOpacity>,
            )
          }

          return (
            <>
              <View
                className={clsx(`flex-row`, {
                  'bg-gray-100 dark:bg-darker rounded':
                    rowIndex === 0 && !!favorites.length && !store.ui.query,
                })}>
                {res}
              </View>
            </>
          )
        }}
      />
    </View>
  )
})
