import { LegendList, LegendListRef } from '@legendapp/list'
import clsx from 'clsx'
import { FileIcon } from 'components/FileIcon'
import { Key } from 'components/Key'
import { LoadingBar } from 'components/LoadingBar'
import { MainInput } from 'components/MainInput'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useStore } from 'store'
import { PasteItem } from 'stores/clipboard.store'

interface Props {
  style?: ViewStyle
  className?: string
}

const RenderItem = observer(
  ({ item, index }: { item: PasteItem; index: number }) => {
    const store = useStore()
    const selectedIndex = store.ui.selectedIndex
    const isActive = index === selectedIndex
    return (
      <TouchableOpacity
        onPress={() => {
          store.ui.setSelectedIndex(index)
          store.keystroke.simulateEnter()
        }}
        className={clsx('items-center flex-row rounded gap-2 p-2', {
          'bg-accent': isActive,
          'opacity-80': !isActive,
        })}>
        <FileIcon
          url={decodeURIComponent(
            item.bundle?.replace('file://', '') ??
            item.url?.replace('file://', '') ??
            '',
          )}
          className="h-6 w-6"
        />

        <Text className={clsx('text-xs text flex-1')} numberOfLines={1}>
          {item.text.trim()}
        </Text>

        {/* {!!item.url && (
        <Image src={`file://${item.url}`} className="h-20 w-20" />
      )} */}
      </TouchableOpacity>
    )
  },
)

function isPngOrJpg(url: string | null | undefined) {
  if (!url) {
    return false
  }
  let lowercaseUrl = url.toLowerCase()
  return (
    lowercaseUrl.includes('.png') ||
    lowercaseUrl.includes('.jpg') ||
    lowercaseUrl.includes('.jpeg')
  )
}

export const ClipboardWidget: FC<Props> = observer(() => {
  const store = useStore()
  const data = store.clipboard.clipboardItems
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<LegendListRef | null>(null)

  useEffect(() => {
    if (data.length > 0 && selectedIndex < data.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [selectedIndex])

  return (
    <View className="flex-1">
      <View className="flex-row px-3">
        <MainInput placeholder="Search Pasteboard..." showBackButton />
      </View>
      <LoadingBar />
      <View className="flex-1 flex-row">
        <View className="w-64 h-full">
          <LegendList
            key={`${data.length}`}
            data={data}
            className='flex-1'
            contentContainerStyle={STYLES.contentContainer}
            ref={listRef}
            recycleItems
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center">
                <Text className="darker-text">[ ]</Text>
              </View>
            }
            renderItem={RenderItem}
          />
        </View>
        <View className="flex-1 px-3 py-2">
          {!!data[selectedIndex] && (
            <View className="dark:bg-black/20 bg-white rounded-lg p-3">
              {!data[selectedIndex].url && (
                <Text className="text-xs">
                  {data[selectedIndex]?.text ?? []}
                </Text>
              )}
              {/* {!!data[selectedIndex].url &&
              isPngOrJpg(data[selectedIndex].url) && (
                <Image
                  source={{
                    uri: `file://${data[selectedIndex].url}`,
                  }}
                  className="flex-1 rounded-lg"
                  style={{resizeMode: 'contain'}}
                />
              )} */}
              {!!data[selectedIndex].url &&
                !isPngOrJpg(data[selectedIndex].url) && (
                  <View className="flex-1 w-full items-center justify-center">
                    <FileIcon
                      url={`file://${data[selectedIndex].url}`}
                      className="h-20 w-20"
                    />
                    <Text className='font-mono'>{data[selectedIndex].text}</Text>
                  </View>
                )}
            </View>
          )}
        </View>
      </View>
      {/* Shortcut bar at the bottom */}
      <View className="py-2 px-4 flex-row items-center justify-end gap-1 subBg border-t border-color">
        <Text className="text-xs darker-text mr-1">Delete All</Text>
        <Key symbol={'⇧'} />
        <Key symbol={'⌫'} />
        <View className="mx-2" />
        <Text className="text-xs darker-text mr-1">Delete Item</Text>
        <Key symbol={'⌫'} />
        <View className="mx-2" />
        <Text
          className={'text-xs mr-1'}>
          Paste
        </Text>
        <Key symbol={'⏎'} primary />
      </View>
    </View>
  )
})

const STYLES = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 6,
    paddingLeft: 8,
  },
})
