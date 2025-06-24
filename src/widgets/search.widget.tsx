import {LegendList, LegendListRef} from '@legendapp/list'
import {Icons} from 'assets'
import clsx from 'clsx'
import Favicon from 'components/Favicon'
import {FileIcon} from 'components/FileIcon'
import {Key} from 'components/Key'
import {LoadingBar} from 'components/LoadingBar'
import {MainInput} from 'components/MainInput'
import {renderToKeys} from 'lib/shorcuts'
import {observer} from 'mobx-react-lite'
import {FC, useEffect, useRef} from 'react'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {useStore} from 'store'
import {ItemType, Widget} from 'stores/ui.store'

const ItemRow = observer(({item, index}: {item: Item; index: number}) => {
  const store = useStore()
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
      className={clsx('flex-row items-center rounded-xl py-1', {
        'bg-accent': isActive,
      })}>
      <View className="flex-1 flex-row items-center px-3 h-10">
        {item.isRunning && (
          <View
            className={clsx(
              'absolute bottom-1 left-[19px] h-[3px] w-[3px] rounded-full bg-neutral-600 dark:bg-neutral-400',
              {
                'bg-white dark:bg-white': isActive,
              },
            )}
          />
        )}
        {!!item.url && item.type != ItemType.BOOKMARK && (
          <FileIcon url={item.url} className={'w-6 h-6'} />
        )}
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

        {item.type === ItemType.BOOKMARK && (
          <Favicon url={item.url!} fallback={item.faviconFallback} />
        )}

        {(Platform.OS === 'macos' || Platform.OS === 'ios') &&
          !!item.IconComponent && <item.IconComponent />}
        <Text
          numberOfLines={1}
          className={clsx('ml-3 text max-w-xl', {
            'text-white': isActive,
          })}>
          {item.name}
        </Text>

        <View className="flex-1" />

        {item.type === ItemType.BOOKMARK && (
          <Text
            className={clsx('darker-text text-xs', {
              'text-white dark:text-neutral-200': isActive,
            })}>
            Browser Bookmark
          </Text>
        )}

        {!!item.subName && (
          <Text
            className={clsx('darker-text text-xs', {
              'text-white dark:text-white': isActive,
            })}>
            {item.subName}
          </Text>
        )}

        {item.type === ItemType.FILE && (
          <Text
            className={clsx('darker-text text-xs', {
              'text-white dark:text-white': isActive,
            })}>
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
})

const EmptyComponent = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-neutral-300 dark:text-neutral-500 text-5xl font-thin">
        [ ]
      </Text>
    </View>
  )
}

export const SearchWidget: FC = observer(() => {
  const store = useStore()
  const focused = store.ui.focusedWidget === Widget.SEARCH
  const listRef = useRef<LegendListRef | null>(null)
  const items = store.ui.items

  useEffect(() => {
    if (focused && items.length && store.ui.selectedIndex < items.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [focused, store.ui.selectedIndex])

  return (
    <View
      className={clsx({
        'flex-1': !!store.ui.query,
      })}>
      <View className="flex-row items-center gap-2 px-3">
        <MainInput className="flex-1" hideIcon />
      </View>

      {!!store.ui.query && (
        <>
          <LoadingBar />
          <LegendList
            className="flex-1"
            contentContainerStyle={STYLES.contentContainer}
            ref={listRef}
            data={items}
            keyExtractor={item => item.id}
            renderItem={ItemRow}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={EmptyComponent}
            recycleItems
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

const STYLES = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
})
