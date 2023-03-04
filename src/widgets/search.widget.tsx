import {Icons} from 'assets'
import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {LoadingBar} from 'components/LoadingBar'
import {StyledFlatList} from 'components/StyledFlatList'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  FlatList,
  Image,
  Platform,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native'
import {useStore} from 'store'
import {ItemType, Widget} from 'stores/ui.store'
import colors from 'tailwindcss/colors'

export const SearchWidget: FC = observer(() => {
  const store = useStore()
  const colorScheme = useColorScheme()
  const focused = store.ui.focusedWidget === Widget.SEARCH
  const inputRef = useRef<TextInput | null>(null)
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    if (focused && store.ui.items.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [focused, store.ui.selectedIndex])

  // assignment to get mobx to update the component
  const items = store.ui.items

  const renderItem = ({item, index}: {item: Item; index: number}) => {
    const isActive = index === store.ui.selectedIndex && focused

    // this is used for things like calculator results
    if (item.type === ItemType.TEMPORARY_RESULT) {
      return (
        <View key={index} className="flex-row items-center">
          <View
            className={clsx(
              'w-[2px] bg-transparent h-[80%] rounded-tr rounded-br mr-[7px]',
              {
                'bg-neutral-800 dark:bg-white': isActive,
              },
            )}
          />
          <View
            className={clsx('flex-1 flex-row items-center p-2 rounded', {
              'bg-lightHighlight dark:bg-darkHighlight': isActive,
            })}>
            <Text className="text-2xl">{store.ui.temporaryResult}</Text>
          </View>
        </View>
      )
    }

    return (
      <View className="flex-row items-center">
        <View
          className={clsx(
            'w-[2px] bg-transparent h-[80%] rounded-tr rounded-br mr-[7px]',
            {
              'bg-neutral-800 dark:bg-white': isActive,
            },
          )}
        />
        <View
          className={clsx('flex-1 flex-row items-center p-2 rounded', {
            'bg-lightHighlight dark:bg-darkHighlight': isActive,
          })}>
          {!!item.url && <FileIcon url={item.url} className="w-4 h-4" />}
          {item.type !== ItemType.CUSTOM && !!item.icon && (
            <Text className="text-xs">{item.icon}</Text>
          )}
          {item.type === ItemType.CUSTOM && !!item.icon && (
            <View className="h-4 w-4 rounded items-center justify-center">
              <Image
                // @ts-expect-error
                source={Icons[item.icon]}
                style={{
                  tintColor: item.color,
                  height: 12,
                  width: 12,
                }}
              />
            </View>
          )}
          {!!item.iconImage && (
            <Image
              source={item.iconImage}
              className="w-4 h-4"
              resizeMode="contain"
              style={{
                tintColor:
                  colorScheme === 'dark'
                    ? undefined
                    : isActive
                    ? 'black'
                    : colors.neutral[500],
              }}
            />
          )}
          {/* Somehow this component breaks windows build */}
          {(Platform.OS === 'macos' || Platform.OS === 'ios') &&
            !!item.iconComponent && <item.iconComponent />}
          <Text
            numberOfLines={1}
            className={clsx(
              'ml-3 text-sm text-neutral-500 dark:text-neutral-400 max-w-xl',
              {
                'text-black dark:text-white': isActive,
              },
            )}>
            {item.name}
          </Text>

          <View className="flex-1" />
          {!!item.subName && (
            <Text className="ml-3 text-sm text-neutral-500">
              {item.subName}
            </Text>
          )}
          {item.type === ItemType.BOOKMARK && (
            <Text className="dark:text-neutral-500 text-xs">Bookmark</Text>
          )}
          {!!item.shortcut && (
            <View className="flex-row">
              {item.shortcut.split(' ').map((char, i) => (
                <Text
                  key={i}
                  className={clsx('mr-1 text-xs dark:text-neutral-500', {
                    'dark:text-white': isActive,
                  })}>
                  {char}
                </Text>
              ))}
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
      <View className="h-12 pt-1 px-3 flex-row items-center">
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          ref={inputRef}
          className="flex-1 text-lg"
          placeholderTextColor={
            colorScheme === 'dark' ? colors.neutral[500] : colors.neutral[400]
          }
          placeholder={'Search for commands and actions...'}
          selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
        />
      </View>

      <LoadingBar />

      {!store.ui.query && !!store.ui.items.length && (
        <View className="px-3 py-2">
          {items.map((item, index) =>
            renderItem({item: {...item, isFavorite: true}, index}),
          )}
        </View>
      )}

      {!!store.ui.query && (
        <StyledFlatList
          className="flex-1"
          windowSize={8}
          contentContainerStyle="flex-grow-1 pr-2 py-2"
          ref={listRef}
          data={items}
          keyExtractor={(item: any, i) => `${item.name}-${item.type}-${i}`}
          renderItem={renderItem as any}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
})
