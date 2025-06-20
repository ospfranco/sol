import {LegendList, LegendListRef} from '@legendapp/list'
import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {Key} from 'components/Key'
import {LoadingBar} from 'components/LoadingBar'
import {MainInput} from 'components/MainInput'
import {observer} from 'mobx-react-lite'
import {FC, useEffect, useRef} from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useStore} from 'store'

interface Props {
  className?: string
}

const RenderItem = observer(({item, index}: any) => {
  const store = useStore()
  const selectedIndex = store.ui.selectedIndex

  const isActive = index === selectedIndex
  return (
    <View
      className={clsx('flex-row items-center rounded-lg h-12', {
        highlight: isActive,
      })}>
      <View className="flex-1 flex-row items-center px-6 h-9">
        {!!item.url && (
          <View className="gap-1 items-center flex-row">
            <FileIcon url={item.url} className={'w-6 h-6'} />
          </View>
        )}
        <Text
          numberOfLines={1}
          className={clsx('ml-3 flex-1', {
            'text-white dark:text-white': isActive,
          })}>
          {item.name}
        </Text>
        <Text
          className={clsx('darker-text text-xs', {
            'text-white dark:text-white': isActive,
          })}>
          {item.url!.slice(0, 45)}
        </Text>
      </View>
    </View>
  )
})

export const FileSearchWidget: FC<Props> = observer(() => {
  const store = useStore()
  const data = store.ui.files
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<LegendListRef | null>(null)

  useEffect(() => {
    if (data.length && store.ui.selectedIndex < data.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [selectedIndex])

  return (
    <View className="flex-1">
      <View className="flex-row px-3">
        <MainInput placeholder="Search for files..." showBackButton />
      </View>
      <LoadingBar />
      <LegendList
        data={data}
        className="flex-1"
        contentContainerStyle={STYLES.contentContainer}
        ref={listRef}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="dark:text-neutral-700 text-sm text-neutral-500">
              No items
            </Text>
          </View>
        }
        keyExtractor={(_, index) => index.toString()}
        renderItem={RenderItem}
      />

      {data.length > 0 && (
        <View className="py-2 px-4 flex-row items-center justify-end gap-1 subBg">
          <Text className="text-sm mr-2">Open Folder</Text>
          <Key symbol={'⇧'} />
          <Key symbol={'⏎'} />
          <Text className="text-sm mx-2">Open</Text>
          <Key symbol={'⏎'} primary />
        </View>
      )}
    </View>
  )
})

const STYLES = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
})
