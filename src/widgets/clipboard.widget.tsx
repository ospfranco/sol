import {Assets} from 'assets'
import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  FlatList,
  Image,
  Text,
  TextInput,
  View,
  ViewStyle,
  useColorScheme,
} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const ClipboardWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  useFullSize()
  const scheme = useColorScheme()
  const store = useStore()
  const data = store.clipboard.clipboardItems
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    if (data.length > 0) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [selectedIndex])

  return (
    <View style={tw.style(`flex-1`, style)}>
      <View style={tw`flex-1`}>
        <View
          style={tw`h-10 pt-2 px-3 justify-center border-b border-lightBorder dark:border-darkBorder`}>
          <TextInput
            autoFocus
            // @ts-expect-error
            enableFocusRing={false}
            value={store.ui.query}
            onChangeText={store.ui.setQuery}
            selectionColor={solNative.accentColor}
            placeholderTextColor={tw.color('dark:text-gray-400 text-gray-500')}
            placeholder="Search clipboard..."
          />
        </View>
        <FlatList
          data={data}
          contentContainerStyle={tw`flex-grow-1 p-3`}
          ref={listRef}
          ListEmptyComponent={
            <View style={tw`flex-1 justify-center items-center`}>
              <Text style={tw`dark:text-gray-700 text-sm text-gray-500`}>
                No items
              </Text>
            </View>
          }
          renderItem={({item, index}) => {
            const isSelected = index === selectedIndex
            return (
              <View
                style={tw.style(`p-3 rounded flex-row`, {
                  'bg-accent bg-opacity-50 dark:bg-opacity-40': isSelected,
                })}>
                <Image
                  source={Assets.DocumentIcon}
                  style={tw.style(`h-4 w-4`, {
                    tintColor: scheme === 'dark' ? 'white' : 'black',
                  })}
                  resizeMode="contain"
                />
                <Text style={tw`text-sm ml-3`}>{item.substring(0, 256)}</Text>
              </View>
            )
          }}
        />
      </View>
      <View
        style={tw`border-t bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30 border-lightBorder dark:border-darkBorder px-6 pt-1 pb-2 flex-row items-center`}>
        <Text style={tw`text-xs dark:text-gray-400 text-gray-500`}>
          <Text style={tw`text-xs`}>↩</Text> Paste
        </Text>
        <View
          style={tw`border-r border-lightBorder dark:border-darkBorder h-3 mx-4`}
        />
        <Text style={tw`text-xs dark:text-gray-400 text-gray-500`}>
          <Text style={tw`text-xs`}>⌘ + ↩</Text> Open in browser
        </Text>
      </View>
    </View>
  )
})
