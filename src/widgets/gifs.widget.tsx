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

  useEffect(() => {
    store.ui.searchGifs()
  }, [store.ui.query])

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
      <ScrollView
        style={tw``}
        contentContainerStyle={tw`flex-row flex-wrap px-3`}>
        {store.ui.gifs.map((gif, index) => {
          return (
            <View
              style={tw.style(`p-2 rounded border border-transparent`, {
                'bg-accent bg-opacity-50 dark:bg-opacity-40 border-accentDim':
                  index === store.ui.selectedIndex,
              })}>
              <Image
                source={{uri: gif.images.downsized.url}}
                style={tw.style(`w-31 h-31 rounded`)}
              />
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
})
