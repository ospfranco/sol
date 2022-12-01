import {Assets, Icons} from 'assets'
import {FileIcon} from 'components/FileIcon'
import {Key} from 'components/Key'
import {LoadingBar} from 'components/LoadingBar'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  FlatList,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import {useStore} from 'store'
import {ItemType, Widget} from 'stores/ui.store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

export const SearchWidget: FC = observer(() => {
  useDeviceContext(tw)
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

    if (item.type === ItemType.TEMPORARY_RESULT) {
      return (
        <View
          key={index}
          style={tw.style(
            `justify-center items-center px-3 py-2 m-3 mb-2 rounded-lg border border-transparent`,
            {
              'bg-proGray-900 border-neutral-300': isActive,
            },
          )}>
          <Text
            style={tw.style(`text-xl`, {
              'text-white dark:text-white': isActive,
            })}>
            {store.ui.temporaryResult}
          </Text>
        </View>
      )
    }

    return (
      <View
        style={tw.style(
          `flex-row items-center px-3 rounded-lg py-1.5 border border-transparent`,
          {
            'bg-gray-200 dark:bg-proGray-900 border-gray-300 dark:border-neutral-700':
              isActive,
          },
        )}>
        {!!item.url && <FileIcon url={item.url} style={tw`w-4 h-4`} />}
        {item.type !== ItemType.CUSTOM && !!item.icon && (
          <Text style={tw`text-xs`}>{item.icon}</Text>
        )}
        {item.type === ItemType.CUSTOM && !!item.icon && (
          <View
            style={tw`h-4 w-4 bg-gray-100 dark:bg-neutral-800 rounded items-center justify-center`}>
            <Image
              // @ts-expect-error
              source={Icons[item.icon]}
              style={tw.style({
                tintColor: item.color,
                height: 12,
                width: 12,
              })}
            />
          </View>
        )}
        {!!item.iconImage && (
          <Image source={item.iconImage} style={tw`w-4 h-4`} />
        )}
        {/* Somehow this component breaks windows build */}
        {(Platform.OS === 'macos' || Platform.OS === 'ios') &&
          !!item.iconComponent && <item.iconComponent />}
        <Text
          style={tw.style('ml-3 text-sm', {
            // 'text-white': isActive,
          })}>
          {item.name}
        </Text>
        {!!item.subName && (
          <Text style={tw.style('ml-3 text-sm text-gray-500')}>
            {item.subName}
          </Text>
        )}
        <View style={tw`flex-1`} />
        {isActive && (
          <TouchableOpacity
            onPress={() => {
              store.ui.toggleFavorite(item)
            }}
            style={tw`pr-1`}>
            <Image
              source={item.isFavorite ? Assets.StarFilled : Assets.Star}
              style={tw.style('h-[2.5] w-4', {
                tintColor: 'white',
              })}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        {/* {item.isFavorite && !store.ui.query && (
          <Text
            style={tw.style(`text-gray-500 dark:text-gray-400 text-xs w-6`, {
              'text-white dark:text-white': isActive,
            })}>
            ⌘ {index + 1}
          </Text>
        )} */}
        {!!item.shortcut && (
          <View style={tw`flex-row`}>
            {item.shortcut.split(' ').map((char, i) => (
              <View key={i} style={tw`mr-1`}>
                <Key title={char} />
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }

  return (
    <View
      style={tw.style({
        'flex-1': !!store.ui.query,
      })}>
      <View style={tw`h-12 mt-1 mx-3 flex-row items-center`}>
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          ref={inputRef}
          style={tw.style(`flex-1 text-lg`)}
          placeholderTextColor={
            colorScheme === 'dark'
              ? tw.color('text-neutral-700')
              : tw.color('text-neutral-400')
          }
          placeholder={'Type to search...'}
          selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
        />
      </View>

      <LoadingBar />

      {!store.ui.query && !!store.ui.items.length && (
        <View style={tw`px-3 py-2`}>
          {items.map((item, index) =>
            renderItem({item: {...item, isFavorite: true}, index}),
          )}
        </View>
      )}

      {!!store.ui.query && (
        <FlatList<Item>
          style={tw`flex-1 dark:bg-black dark:bg-opacity-50`}
          windowSize={8}
          contentContainerStyle={tw.style(`flex-grow-1 p-3`)}
          ref={listRef}
          data={items}
          keyExtractor={(item, i) => `${item.name}-${item.type}-${i}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
})
