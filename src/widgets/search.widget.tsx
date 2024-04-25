import {Assets, Icons} from 'assets'
import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {GradientView} from 'components/GradientView'
import {Key} from 'components/Key'
import {MainInput} from 'components/MainInput'
import {StyledFlatList} from 'components/StyledFlatList'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, Image, Platform, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {ItemType, Widget} from 'stores/ui.store'
import customColors from '../colors'

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
          className="flex-row items-center rounded-lg py-2"
          style={{
            backgroundColor: isActive ? customColors.accentBg : undefined,
          }}>
          <View className={clsx('flex-1 px-4')}>
            <Text className="text-neutral-600 dark:text-neutral-400">
              {store.ui.query}
            </Text>
            <Text className="text-2xl font-semibold mt-2">
              {store.ui.temporaryResult}
            </Text>
          </View>
        </View>
      )
    }

    return (
      <View
        className={clsx('flex-row items-center rounded-lg py-2', {
          'bg-highlight': isActive,
        })}>
        <View className="flex-1 flex-row items-center px-4 h-9">
          {!!item.url && (
            <View className="g-1 items-center flex-row">
              {item.isRunning && (
                <View className="absolute -left-2 h-1 w-1 rounded-full bg-neutral-600 dark:bg-neutral-400" />
              )}
              <FileIcon url={item.url} className={'w-6 h-6'} />
            </View>
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
          {/* Somehow this component breaks windows build */}
          {(Platform.OS === 'macos' || Platform.OS === 'ios') &&
            !!item.IconComponent && <item.IconComponent />}
          <Text
            numberOfLines={1}
            className={'ml-3 text-black dark:text-white max-w-xl'}
            style={{fontSize: 15}}>
            {item.name}
          </Text>

          <View className="flex-1" />
          {!!item.subName && (
            <Text className={'ml-3 text-neutral-500 dark:text-white'}>
              {item.subName}
            </Text>
          )}
          {item.type === ItemType.BOOKMARK && (
            <Text
              className={clsx('text-neutral-500 dark:text-neutral-300', {
                'dark:text-white': isActive,
              })}>
              Bookmark
            </Text>
          )}
          {item.type === ItemType.PREFERENCE_PANE && (
            <Text
              className={clsx('dark:text-neutral-300 ml-3', {
                'dark:text-white': isActive,
              })}>
              Settings
            </Text>
          )}
          {/* {item.type === ItemType.CUSTOM && (
            <Key title="Delete" symbol="⇧ delete" />
          )} */}
          {!!item.shortcut && (
            <View className="flex-row g-1 items-center">
              {item.shortcut.split(' ').map((char, i) => {
                // if (char === 'then') {
                //   return (
                //     <Text key={i} className="text-sm dark:text-neutral-400">
                //       then
                //     </Text>
                //   )
                // }
                return (
                  <Key
                    key={i}
                    title={''}
                    symbol={char !== 'then' ? char : undefined}
                  />
                )
              })}
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View
      className={clsx({
        'flex-1': !!store.ui.query,
      })}>
      <View className="flex-row items-center">
        <MainInput className="flex-1" />
        {!items.length && (
          <Image source={Assets.googleLogo} className="mr-4 h-4 w-4" />
        )}
      </View>

      {!!store.ui.query && (
        <>
          <StyledFlatList
            className="flex-1"
            windowSize={8}
            contentContainerStyle="flex-grow pb-2 pt-1 px-2"
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

          <View
            className="border-t py-2 px-4 border-lightBorder dark:border-darkBorder flex-row items-center justify-end g-1"
            style={{
              backgroundColor: store.ui.isDarkMode ? '#00000018' : '#00000005',
            }}>
            {store.ui.currentItem?.type === ItemType.CUSTOM && (
              <>
                <Text className="text-xs mr-2">Delete</Text>
                <Key symbol={'⇧'} />
                <Key symbol={'delete'} />
                <View className="border-l h-2/3 border-lightBorder dark:border-darkBorder mx-2" />
              </>
            )}
            <Text className="text-xs mr-2">Translate</Text>
            <Key symbol={'⇧'} />
            <Key symbol={'⏎'} />
            <View className="border-l h-2/3 border-lightBorder dark:border-darkBorder mx-2" />
            <Text
              className={clsx('text-xs mr-2', {
                'font-semibold': !items.length,
              })}>
              Search
            </Text>
            {!!items.length && <Key symbol={'⌘'} />}
            <Key symbol={'⏎'} primary={!items.length} />
            {!!items.length && (
              <>
                <View className="border-l h-2/3 border-lightBorder dark:border-darkBorder mx-2" />
                <Text
                  className={clsx('text-xs mr-2', {
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
