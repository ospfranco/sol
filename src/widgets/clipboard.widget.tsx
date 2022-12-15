import clsx from 'clsx'
import {Key} from 'components/Key'
import {StyledFlatList} from 'components/StyledFlatList'
import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, Text, TextInput, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const ClipboardWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  useFullSize()

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
    <View className="flex-1">
      <View className="h-12 pt-1 px-3 dark:bg-neutral-900 flex-row items-center">
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          selectionColor={solNative.accentColor}
          placeholderTextColor={tw.color(
            'dark:text-neutral-400 text-neutral-500',
          )}
          className="text-lg flex-1"
          placeholder="Search clipboard history..."
        />
      </View>
      <StyledFlatList
        data={data}
        className="flex-1 dark:bg-black dark:bg-opacity-50"
        contentContainerStyle={tw`flex-grow p-3`}
        ref={listRef}
        ListEmptyComponent={
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`dark:text-neutral-700 text-sm text-neutral-500`}>
              No items
            </Text>
          </View>
        }
        renderItem={({item, index}: any) => {
          const isSelected = index === selectedIndex
          return (
            <View
              className={clsx(
                'flex-row px-3 rounded-lg py-2 border border-transparent',
                {
                  'bg-gray-200 dark:bg-proGray-900 border-gray-300 dark:border-neutral-700':
                    isSelected,
                },
              )}>
              <Text className="text-sm dark:text-neutral-500">{index + 1}</Text>
              <Text className="text-sm flex-1 ml-3">
                {item.substring(0, 256)}
              </Text>
            </View>
          )
        }}
      />
      {store.ui.showHintBar && (
        <View
          style={tw`border-t bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30 border-lightBorder dark:border-darkBorder p-2 flex-row items-center`}>
          <View style={tw`flex-1`} />
          <Text style={tw`text-xs dark:text-gray-400 text-gray-500`}>
            Open in browser
          </Text>
          <Key style={tw`ml-1`} title="⌘" brRounded />
          <Key style={tw`ml-1`} title="⏎" brRounded />
          <View
            style={tw`border-r border-lightBorder dark:border-darkBorder h-3 mx-4`}
          />
          <Text style={tw`text-xs dark:text-gray-400 text-gray-500 mr-1`}>
            Paste
          </Text>
          <Key title="⏎" primary brRounded />
        </View>
      )}
    </View>
  )
})
