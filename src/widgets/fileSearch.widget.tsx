import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {Key} from 'components/Key'
import {LoadingBar} from 'components/LoadingBar'
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

export const FileSearchWidget: FC<Props> = observer(({style}) => {
  useFullSize()

  const store = useStore()
  const data = store.ui.files
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    if (data.length && store.ui.selectedIndex < data.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [selectedIndex])

  return (
    <View className="flex-1 " style={style}>
      <View className="flex-row px-3">
        <MainInput placeholder="Search for files..." showBackButton />
      </View>
      <LoadingBar />
      <FlatList
        data={data}
        className="flex-1"
        contentContainerClassName="flex-grow pb-2 pt-1 px-2"
        ref={listRef}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="dark:text-neutral-700 text-sm text-neutral-500">
              No items
            </Text>
          </View>
        }
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => {
          const isActive = index === selectedIndex
          return (
            <View
              className={clsx('flex-row items-center rounded-lg py-2', {
                highlight: isActive,
              })}>
              <View className="flex-1 flex-row items-center px-6 h-9">
                {!!item.url && (
                  <View className="gap-1 items-center flex-row">
                    <FileIcon url={item.url} className={'w-6 h-6'} />
                  </View>
                )}

                <Text numberOfLines={1} className={'ml-3 text flex-1'}>
                  {item.name}
                </Text>
                <Text className="darker-text text-xs">
                  {item.url!.slice(0, 45)}
                </Text>
              </View>
            </View>
          )
        }}
      />

      <View className="py-2 px-4 flex-row items-center justify-end gap-1 subBg">
        <Text className="text-sm mr-2">Open Folder</Text>
        <Key symbol={'⇧'} />
        <Key symbol={'⏎'} />
        <Text className="text-sm mx-2">Open</Text>
        <Key symbol={'⏎'} primary />
      </View>
    </View>
  )
})
