import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {MainInput} from 'components/MainInput'
import {useFullSize} from 'hooks/useFullSize'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, Text, View, ViewStyle} from 'react-native'
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
    <View className="flex-1 bg-white dark:bg-dark" style={style}>
      <MainInput placeholder="Search pasteboard history..." showBackButton />
      <FlatList
        data={data}
        className="flex-1"
        contentContainerClassName="flex-grow"
        ref={listRef}
        onScrollToIndexFailed={() => {}}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="dark:text-neutral-700 text-sm text-neutral-500">
              No items
            </Text>
          </View>
        }
        renderItem={({item, index}: any) => {
          const isActive = index === selectedIndex
          return (
            <View
              className={clsx(
                'mx-2 mb-1 flex-row items-center rounded g-2 p-2',
                {
                  'bg-neutral-300 dark:bg-neutral-700': isActive,
                },
              )}>
              <FileIcon
                url={decodeURIComponent(item.bundle?.replace('file://', ''))}
                className="h-6 w-6"
              />
              <Text
                className={clsx('text-sm flex-1 dark:text-neutral-200', {
                  'dark:text-white font-medium': isActive,
                })}>
                {item.text.substring(0, 256)}
              </Text>
            </View>
          )
        }}
      />
    </View>
  )
})
