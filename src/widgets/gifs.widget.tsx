import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {solNative} from 'lib/SolNative'
import {Emoji, emojiFuse, emojis, EMOJIS_PER_ROW, groupEmojis} from 'lib/emoji'

interface Props {
  style?: ViewStyle
}

export const GifsWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const query = store.ui.query
  const selectedIndex = store.ui.selectedIndex
  const storeRowIndex = Math.floor(selectedIndex / EMOJIS_PER_ROW)
  const storeSubIndex = selectedIndex % EMOJIS_PER_ROW
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    solNative.turnOnHorizontalArrowListeners()
    return () => {
      solNative.turnOffHorizontalArrowListeners()
    }
  }, [])

  useEffect(() => {
    listRef.current?.scrollToIndex({
      index: storeRowIndex,
      viewOffset: 80,
    })
  }, [storeRowIndex])

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
          placeholder="Search gifs..."
        />
      </View>
      <ScrollView style={tw``} contentContainerStyle={tw`flex-row flex-wrap`}>
        {store.ui.gifs.map(gif => {
          return (
            <Image
              source={{uri: gif.images.downsized.url}}
              // source={{uri: gif.images.original.url}}
              style={tw`w-32 h-32 rounded m-2`}
            />
          )
        })}
      </ScrollView>
      {/* <FlatList<Emoji[]>
        ref={listRef}
        style={tw`flex-1 mt-2`}
        contentContainerStyle={tw`pb-3 px-3`}
        data={data}
        initialNumToRender={7}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item: emojiRow, index: rowIndex}) => {
          // avoid function allocation for more speeeeed
          let res = []
          for (let i = 0; i < emojiRow.length; i++) {
            const isSelected = i === storeSubIndex && rowIndex === storeRowIndex
            const emoji = emojiRow[i]
            res.push(
              <View
                style={tw.style(
                  `h-18 w-18 items-center justify-center rounded border border-transparent`,
                  {
                    'bg-accent bg-opacity-50 dark:bg-opacity-40 border-accentDim':
                      isSelected,
                  },
                )}
                key={`${emoji.emoji}-${i}_${rowIndex}`}>
                <Text style={tw`text-3xl`}>{emoji.emoji}</Text>
              </View>,
            )
          }

          return (
            <>
              <View style={tw.style(`flex-row`)}>{res}</View>
              {rowIndex === 0 && !!favorites.length && !store.ui.query && (
                <View
                  style={tw`border-b border-lightBorder dark:border-darkBorder my-2`}
                />
              )}
            </>
          )
        }}
      /> */}
    </View>
  )
})
