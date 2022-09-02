import {LoadingBar} from 'components/LoadingBar'
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
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

const ROW_HEIGHT = 72

export const EmojisWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  useFullSize()
  const store = useStore()
  const query = store.ui.query
  const selectedIndex = store.ui.selectedIndex
  const storeRowIndex = Math.floor(selectedIndex / EMOJIS_PER_ROW)
  const storeSubIndex = selectedIndex % EMOJIS_PER_ROW
  const listRef = useRef<FlatList | null>(null)

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
    <View style={tw.style('flex-1', style)}>
      <View style={tw`py-4 px-3 justify-center`}>
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          selectionColor={solNative.accentColor}
          placeholderTextColor={tw.color('text-gray-500')}
          placeholder="Search emojis..."
          style={tw`text-lg`}
        />
      </View>
      <LoadingBar />
      <FlatList<Emoji[]>
        ref={listRef}
        style={tw`-mr-2`}
        contentContainerStyle={tw`flex-grow-1 p-3`}
        data={data}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`dark:text-gray-400 text-gray-500 text-sm`}>
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
        renderItem={({item: emojiRow, index: rowIndex}) => {
          let res = []
          for (let i = 0; i < emojiRow.length; i++) {
            const isSelected = i === storeSubIndex && rowIndex === storeRowIndex
            const emoji = emojiRow[i]
            res.push(
              <TouchableOpacity
                onPress={() => {
                  store.ui.insertEmojiAt(rowIndex * EMOJIS_PER_ROW + i)
                }}
                style={tw.style(
                  `h-[${ROW_HEIGHT}px] w-18 items-center justify-center rounded`,
                  {
                    'bg-accent bg-opacity-50 dark:bg-opacity-40': isSelected,
                  },
                )}
                key={`${emoji.emoji}-${i}_${rowIndex}`}>
                <Text style={tw`text-3xl`}>{emoji.emoji}</Text>
              </TouchableOpacity>,
            )
          }

          return (
            <>
              <View
                style={tw.style(`flex-row`, {
                  'dark:bg-black dark:bg-opacity-10 rounded bg-gray-200 bg-opacity-50':
                    rowIndex === 0 && !!favorites.length && !store.ui.query,
                })}>
                {res}
              </View>
              {/* { && (
                <View
                  style={tw`border-b border-lightBorder dark:border-darkBorder my-2`}
                />
              )} */}
            </>
          )
        }}
      />
    </View>
  )
})
