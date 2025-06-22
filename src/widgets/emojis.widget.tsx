import clsx from 'clsx'
import {MainInput} from 'components/MainInput'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import {FC, useEffect, useRef} from 'react'
import {Text, View, ViewStyle, TouchableOpacity} from 'react-native'
import {useStore} from 'store'
import {EMOJI_ROW_SIZE, Emoji} from 'stores/emoji.store'
import {LegendList, LegendListRef} from '@legendapp/list'
import {LoadingBar} from 'components/LoadingBar'

interface Props {
  style?: ViewStyle
  className?: string
}

const EmojiRow = observer(
  ({item: emojiRow, index: rowIndex}: {item: Emoji[]; index: number}) => {
    const store = useStore()

    const selectedIndex = store.ui.selectedIndex
    const storeRowIndex = Math.floor(selectedIndex / EMOJI_ROW_SIZE)
    const storeSubIndex = selectedIndex % EMOJI_ROW_SIZE

    let res = []
    for (let i = 0; i < emojiRow.length; i++) {
      const isSelected = i === storeSubIndex && rowIndex === storeRowIndex
      const emoji = emojiRow[i]

      res.push(
        <TouchableOpacity
          onPress={() => {
            store.emoji.insert(rowIndex * EMOJI_ROW_SIZE + i)
          }}
          className={clsx(
            `items-center justify-center w-[96] h-[96] rounded-lg`,
            {
              'bg-accent': isSelected,
            },
          )}
          key={`${i}_${rowIndex}`}>
          <Text className="text-5xl">{emoji.emoji}</Text>
        </TouchableOpacity>,
      )
    }

    if (emojiRow.length < EMOJI_ROW_SIZE) {
      res.push(<View className="flex-1" key="end" />)
    }

    return (
      <View
        className={clsx(`flex-row`, {
          'border-b border-lightBorder dark:border-neutral-700 pb-3 mb-2':
            rowIndex === 0 &&
            !!Object.entries(store.emoji.frequentlyUsedEmojis).length &&
            !store.ui.query,
        })}>
        {res}
      </View>
    )
  },
)

const EmptyList = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="dark:text-gray-400 text-gray-500 text-sm">
        No emoji found
      </Text>
    </View>
  )
}

export const EmojisWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  const selectedIndex = store.ui.selectedIndex
  const storeRowIndex = Math.floor(selectedIndex / EMOJI_ROW_SIZE)
  const listRef = useRef<LegendListRef | null>(null)
  const emojis = store.emoji.emojis

  useEffect(() => {
    solNative.turnOnHorizontalArrowsListeners()
    return () => {
      solNative.turnOffHorizontalArrowsListeners()
    }
  }, [])

  useEffect(() => {
    if (emojis.length) {
      listRef.current?.scrollToIndex({
        index: storeRowIndex,
        viewOffset: 80,
      })
    }
  }, [storeRowIndex])

  return (
    <View className="h-full">
      <View className="flex-row px-3">
        <MainInput placeholder="Search Emojis..." showBackButton />
      </View>
      <LoadingBar />
      <LegendList
        ref={listRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 8,
          flexGrow: 1,
        }}
        data={emojis}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyList}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item, index}) => <EmojiRow item={item} index={index} />}
        recycleItems
      />
    </View>
  )
})
