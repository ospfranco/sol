import { Assets, Icons } from 'assets'
import { FileIcon } from 'components/FileIcon'
import { solNative } from 'lib/SolNative'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useRef } from 'react'
import {
  Animated,
  Appearance,
  FlatList,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native'
import { useStore } from 'store'
import { FocusableWidget, Item, ItemType } from 'stores'
import tw from 'tailwind'
import { useDeviceContext } from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const SearchWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const colorScheme = Appearance.getColorScheme()
  const store = useStore()
  const focused = store.ui.focusedWidget === FocusableWidget.SEARCH
  const inputRef = useRef<TextInput | null>(null)
  const listRef = useRef<FlatList | null>(null)
  const animatedBorderRef = useRef(
    new Animated.Value(store.ui.isLoading ? 1 : 0),
  )

  useEffect(() => {
    Animated.timing(animatedBorderRef.current, {
      toValue: store.ui.isLoading ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [store.ui.isLoading])

  useEffect(() => {
    if (focused) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [focused, store.ui.selectedIndex])

  return (
    <View style={style}>
      <View style={tw`pt-2`}>
        <Animated.View
          style={[
            tw`px-3 pt-1 pb-3 flex-row border-b border-lightBorder dark:border-darkBorder relative`,
            {
              borderColor: animatedBorderRef.current.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  colorScheme === 'dark'
                    ? 'rgba(255, 250, 250, .1)'
                    : 'rgba(0, 0, 0, .1)',
                  'rgba(14, 165, 233, 0.8)',
                ],
              }),
            },
          ]}>
          <TextInput
            autoFocus
            // @ts-expect-error
            enableFocusRing={false}
            value={store.ui.query}
            onChangeText={store.ui.setQuery}
            ref={inputRef}
            style={tw`flex-1`}
            selectionColor={solNative.accentColor}
            placeholderTextColor={tw.color('text-gray-500')}
            placeholder="Type something..."
          />
        </Animated.View>
      </View>

      <FlatList<Item>
        style={tw`flex-1`}
        contentContainerStyle={tw`p-3 flex-grow-1`}
        ref={listRef}
        data={store.ui.items}
        keyExtractor={item => `${item.name}-${item.type}`}
        renderItem={({item, index}) => {
          const isActive = index === store.ui.selectedIndex && focused

          if (item.type === ItemType.TEMPORARY_RESULT) {
            return (
              <View
                key={index}
                style={tw.style(
                  `justify-center items-center rounded-lg p-3 mb-2`,
                  {'bg-highlight': isActive},
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
              key={index}
              style={tw.style(`flex-row items-center px-3 py-2 rounded`, {
                'bg-highlight': isActive,
                'mb-2':
                  index === store.ui.favorites.length - 1 && !store.ui.query,
              })}>
              {!!item.url && <FileIcon url={item.url} style={tw`w-4 h-4`} />}
              {item.type !== ItemType.CUSTOM && !!item.icon && (
                <Text style={tw`text-xs`}>{item.icon}</Text>
              )}
              {item.type === ItemType.CUSTOM && (
                <View
                  style={tw`h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded items-center justify-center`}>
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
              {Platform.OS === 'macos' && !!item.iconComponent && <item.iconComponent />}
              <Text
                style={tw.style('ml-3 text-sm flex-1', {
                  'text-white': isActive,
                })}>
                {item.name}
              </Text>
              {isActive && (
                <TouchableOpacity
                  onPress={() => {
                    store.ui.toggleFavorite(item)
                  }}
                  style={tw`pr-1`}
                  >
                  <Image
                    source={item.isFavorite ? Assets.StarFilled : Assets.Star}
                    style={tw.style('h-[2.5] w-4', {
                      tintColor: 'white',
                    })}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
              {item.isFavorite && !store.ui.query && (
                <Text
                  style={tw.style(
                    `text-gray-500 dark:text-gray-400 text-xs w-6`,
                    {
                      'text-white dark:text-white': isActive,
                    },
                  )}>
                  ⌘ {index + 1}
                </Text>
              )}
            </View>
          )
        }}
      />
    </View>
  )
})
