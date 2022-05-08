import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, Text, TextInput, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {solNative} from 'lib/SolNative'
import {Emoji, emojiFuse, emojis, EMOJIS_PER_ROW, groupEmojis} from 'lib/emoji'

interface Props {
  style?: ViewStyle
}

export const EmojisWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const query = store.ui.query
  const selectedIndex = store.ui.selectedIndex
  const storeRowIndex = Math.floor(selectedIndex / EMOJIS_PER_ROW)
  const storeSubIndex = selectedIndex % EMOJIS_PER_ROW
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    listRef.current?.scrollToIndex({
      index: storeRowIndex,
      viewOffset: 80,
    })
  }, [storeRowIndex])

  const data = !!query
    ? groupEmojis(emojiFuse.search(query).map(r => r.item))
    : emojis

  return (
    <View style={tw.style(`flex-1`, style)}>
      <View style={tw`h-10 pt-2 px-3 justify-center`}>
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          selectionColor={solNative.accentColor}
          placeholderTextColor={tw.color('dark:text-gray-400 text-gray-500')}
          placeholder="Search for an emoji..."
        />
      </View>
      <FlatList<Emoji[]>
        ref={listRef}
        style={tw`flex-1 mt-2`}
        contentContainerStyle={tw`pb-3 px-3`}
        data={data}
        initialNumToRender={7}
        renderItem={({item: emojiRow, index: rowIndex}) => {
          return (
            <View style={tw`flex-row justify-around`}>
              {emojiRow.map((emoji, index) => {
                const isSelected =
                  index === storeSubIndex && rowIndex === storeRowIndex
                return (
                  <View
                    style={tw.style(`p-4 rounded border border-transparent`, {
                      'bg-accent bg-opacity-50 dark:bg-opacity-40 border-accentDim':
                        isSelected,
                    })}
                    key={emoji.description}>
                    <Text style={tw`text-3xl`}>{emoji.emoji}</Text>
                  </View>
                )
              })}
            </View>
          )
        }}
      />
    </View>
  )
})
