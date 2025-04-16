import {Assets, Icons} from 'assets'
import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {Key} from 'components/Key'
import {LoadingBar} from 'components/LoadingBar'
import {MainInput} from 'components/MainInput'
import {renderToKeys} from 'lib/shorcuts'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {ItemType, Widget} from 'stores/ui.store'

type Props = {
  style?: ViewStyle
  className?: string
}

export const SearchWidget: FC<Props> = observer(() => {
  const store = useStore()
  const focused = store.ui.focusedWidget === Widget.SEARCH
  const listRef = useRef<FlatList | null>(null)
  const items = store.ui.items

  useEffect(() => {
    if (focused && items.length && store.ui.selectedIndex < items.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [focused, store.ui.selectedIndex])

  const renderItem = ({item, index}: {item: Item; index: number}) => {
    const isActive = index === store.ui.selectedIndex

    // this is used for things like calculator results
    if (item.type === ItemType.TEMPORARY_RESULT) {
      return (
        <View
          className={clsx('flex-row items-center rounded-lg py-6', {
            highlight: isActive,
          })}>
          <View className={clsx('flex-1 px-4 flex-row items-center')}>
            <Text className="text-4xl font-semibold flex-1">
              {store.ui.temporaryResult}
            </Text>
            <Text className="text-neutral-600 dark:text-neutral-400">
              {store.ui.query}
            </Text>
          </View>
        </View>
      )
    }

    return (
      <TouchableOpacity
        onPress={() => {
          store.ui.setSelectedIndex(index)
          store.keystroke.simulateEnter()
        }}
        className={clsx('flex-row items-center rounded-lg py-1 border', {
          'bg-accent': isActive,
          'border-accent': isActive,
          'border-transparent': !isActive,
        })}>
        <View className="flex-1 flex-row items-center pl-6 pr-3 h-9">
          {item.type === ItemType.PREFERENCE_PANE && (
            <Text className={'darker-text text-xs absolute left-2'}>⚙</Text>
          )}

          {item.type === ItemType.BOOKMARK && (
            <Text className="text-xxs absolute darker-text left-2">↗</Text>
          )}
          {item.isRunning && (
            <View className="absolute left-2.5 h-[6px] w-[6px] rounded-full bg-neutral-600 dark:bg-neutral-400" />
          )}
          {!!item.url && <FileIcon url={item.url} className={'w-6 h-6'} />}
          {item.type !== ItemType.CUSTOM && !!item.icon && (
            <Text>{item.icon}</Text>
          )}
          {item.type === ItemType.CUSTOM && !!item.icon && (
            <View className="w-6 h-6 rounded items-center justify-center bg-white dark:bg-black">
              <Image
                // @ts-expect-error
                source={Icons[item.icon]}
                style={{
                  tintColor: item.color,
                  height: 16,
                  width: 16,
                }}
              />
            </View>
          )}
          {!!item.iconImage && (
            <Image
              source={item.iconImage}
              className="w-6 h-6"
              resizeMode="contain"
            />
          )}
          {/* Somehow this component breaks windows build */}
          {(Platform.OS === 'macos' || Platform.OS === 'ios') &&
            !!item.IconComponent && <item.IconComponent />}
          <Text numberOfLines={1} className={'ml-3 text max-w-xl'}>
            {item.name}
          </Text>

          <View className="flex-1" />
          {!!item.subName && (
            <Text className={'ml-3 darker-text'}>{item.subName}</Text>
          )}

          {item.type === ItemType.FILE && (
            <Text className="darker-text text-xs">
              {item.url!.slice(0, 45)}
            </Text>
          )}

          {!!store.ui.shortcuts[item.id] && (
            <View className="flex-row gap-1 items-center">
              {renderToKeys(store.ui.shortcuts[item.id])}
            </View>
          )}
          {item.type === ItemType.BOOKMARK && !!item.bookmarkFolder && (
            <Text className="flex-row gap-1 items-center">{`${item.bookmarkFolder.substring(
              0,
              16,
            )}${item.bookmarkFolder.length > 16 ? '...' : ''}`}</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View
      className={clsx({
        'flex-1': !!store.ui.query,
      })}>
      <View className="flex-row items-center gap-2 px-3">
        <MainInput className="flex-1" />
      </View>

      {!!store.ui.query && (
        <>
          <LoadingBar />
          <FlatList
            className="flex-1"
            windowSize={8}
            contentContainerClassName="flex-grow p-2"
            ref={listRef}
            onScrollToIndexFailed={() => {}}
            data={items}
            keyExtractor={(item: any, i) => `${item.name}-${item.type}-${i}`}
            renderItem={renderItem as any}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center">
                <Text className="text-neutral-300 dark:text-neutral-500 text-5xl font-thin">
                  [ ]
                </Text>
              </View>
            }
          />

          <View className="py-2 px-4 flex-row items-center justify-end gap-1 subBg">
            {store.ui.currentItem?.type === ItemType.CUSTOM && (
              <>
                <Text className="text-xs darker-text mr-1">Delete</Text>
                <Key symbol={'⇧'} />
                <Key symbol={'delete'} />
                <View className="mx-2" />
              </>
            )}
            <Text className="text-xs darker-text mr-1">Translate</Text>
            <Key symbol={'⇧'} />
            <Key symbol={'⏎'} />
            {!items.length && (
              <>
                <View className="mx-2" />
                <Text
                  className={clsx('text-xs darker-text mr-1', {
                    'font-semibold': !items.length,
                  })}>
                  Search
                </Text>
                <Key symbol={'⌘'} />
                <Key symbol={'⏎'} />
              </>
            )}
            <View className="mx-2" />
            <Text
              className={clsx('text-xs darker-text mr-1', {
                'font-semibold': !items.length,
              })}>
              Search
            </Text>
            {!!items.length && <Key symbol={'⌘'} />}
            <Key symbol={'⏎'} primary={!items.length} />
            {!!items.length && (
              <>
                <View className="mx-2" />
                <Text
                  className={clsx('text-xs darker-text mr-1', {
                    'font-semibold': !!items.length,
                  })}>
                  Select
                </Text>
                <Key symbol={'⏎'} primary />
              </>
            )}
          </View>
        </>
      )}
    </View>
  )
})
