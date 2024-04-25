import clsx from 'clsx'
import {MainInput} from 'components/MainInput'
import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {EMOJI_ROW_SIZE, Emoji} from 'stores/emoji.store'

interface Props {
  style?: ViewStyle
  className?: string
}

const ROW_HEIGHT = 110

export const EmojisWidget: FC<Props> = observer(({style}) => {
  useFullSize()
  const store = useStore()
  const selectedIndex = store.ui.selectedIndex
  const storeRowIndex = Math.floor(selectedIndex / EMOJI_ROW_SIZE)
  const storeSubIndex = selectedIndex % EMOJI_ROW_SIZE
  const listRef = useRef<FlatList | null>(null)
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
    <View className="h-full" style={style}>
      <MainInput placeholder="Search emojis..." />
      <FlatList
        ref={listRef}
        className="flex-1"
        contentContainerClassName="flex-grow p-3"
        data={emojis}
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
                  store.emoji.insert(rowIndex * EMOJI_ROW_SIZE + i)
                }}
                className={clsx(
                  `items-center justify-center w-[96] h-[96] rounded border border-transparent`,
                  {
                    'bg-neutral-300 border-neutral-400 dark:bg-neutral-900 dark:border-neutral-700':
                      isSelected,
                  },
                )}
                key={`${i}_${rowIndex}`}>
                <Text className="text-6xl">{emoji.emoji}</Text>
              </TouchableOpacity>,
            )
          }

          if (emojiRow.length < EMOJI_ROW_SIZE) {
            res.push(<View className="flex-1" key="end" />)
          }

          return (
            <View
              style={{height: ROW_HEIGHT}}
              className={clsx(`flex-row`, {
                'border-b border-lightBorder dark:border-neutral-700 pb-3 mb-2':
                  rowIndex === 0 &&
                  !!Object.entries(store.emoji.frequentlyUsedEmojis).length &&
                  !store.ui.query,
              })}>
              {res}
            </View>
          )
        }}
      />
    </View>
  )
})
