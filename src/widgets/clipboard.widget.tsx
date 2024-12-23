import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {MainInput} from 'components/MainInput'
import {useFullSize} from 'hooks/useFullSize'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useStore} from 'store'

interface Props {
  style?: ViewStyle
  className?: string
}

export const ClipboardWidget: FC<Props> = observer(({style}) => {
  useFullSize()

  const store = useStore()
  const data = store.clipboard.clipboardItems
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    if (data.length > 0 && selectedIndex < data.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [selectedIndex])

  return (
    <View className="flex-1" style={style}>
      <View className="flex-row px-3">
        <MainInput placeholder="Search pasteboard history..." showBackButton />
      </View>
      <View className="flex-1 flex-row">
        <View className="w-64">
          <FlatList
            data={data}
            contentContainerClassName="px-2 flex-grow"
            ref={listRef}
            onScrollToIndexFailed={() => {}}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center">
                <Text className="darker-text">[ ]</Text>
              </View>
            }
            renderItem={({item, index}: any) => {
              const isActive = index === selectedIndex
              return (
                <TouchableOpacity
                  onPress={() => {
                    store.ui.setSelectedIndex(index)
                    store.keystroke.simulateEnter()
                  }}
                  className={clsx('items-center flex-row rounded gap-2 p-2', {
                    highlight: isActive,
                    'opacity-80': !isActive,
                  })}>
                  <FileIcon
                    url={decodeURIComponent(
                      item.bundle?.replace('file://', ''),
                    )}
                    className="h-6 w-6"
                  />
                  <Text
                    className={clsx('text-xs text font-mono')}
                    numberOfLines={1}>
                    {item.text.trim()}
                  </Text>
                </TouchableOpacity>
              )
            }}
          />
        </View>
        <View className="flex-1 pb-3 pr-3">
          <View className="flex-1 dark:bg-black bg-white rounded-lg p-3 ">
            <Text className="text-xs" style={{fontFamily: 'Andale Mono'}}>
              {data[selectedIndex]?.text ?? []}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
})
