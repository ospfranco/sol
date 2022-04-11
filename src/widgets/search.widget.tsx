import {Assets, Icons} from 'assets'
import {Fade} from 'components/Fade'
import {FileIcon} from 'components/FileIcon'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  Animated,
  Appearance,
  Image,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget, ItemType} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import inbox from '../assets/inbox.png'

interface Props {
  style?: ViewStyle
}

export const SearchWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const colorScheme = Appearance.getColorScheme()
  const store = useStore()
  const focused = store.ui.focusedWidget === FocusableWidget.SEARCH
  const inputRef = useRef<TextInput | null>(null)
  const listRef = useRef<SectionList | null>(null)
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

  const favorites = store.ui.favorites
  const favoriteItems = store.ui.favoriteItems

  useEffect(() => {
    if (focused) {
      listRef.current?.scrollToLocation({
        sectionIndex:
          !!store.ui.query || favoriteItems.length === 0
            ? 0
            : store.ui.selectedIndex < favoriteItems.length
            ? 0
            : 1,
        itemIndex: !!store.ui.query
          ? store.ui.selectedIndex
          : store.ui.selectedIndex >= favoriteItems.length
          ? store.ui.selectedIndex - favoriteItems.length
          : store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [focused, favorites, favoriteItems, store.ui.selectedIndex])

  let sections = [
    {
      data: store.ui.items,
      key: 'all',
    },
  ]

  if (!store.ui.query && favoriteItems.length) {
    sections.unshift({
      key: 'favorites',
      data: [...favoriteItems],
    })
  }

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
            // @ts-ignore
            enableFocusRing={false}
            value={store.ui.query}
            onChangeText={store.ui.setQuery}
            ref={inputRef}
            style={tw`flex-1`}
            selectionColor="#006ce1"
            placeholderTextColor={tw.color('text-gray-500')}
            placeholder="Type something..."
          />
        </Animated.View>
      </View>

      <>
        {!!store.ui.temporaryResult && (
          <View style={tw`p-3`}>
            <View
              style={tw`bg-highlight bg-opacity-50 dark:bg-gray-500 dark:bg-opacity-30 justify-center items-center rounded-lg p-3`}>
              <Text style={tw`text-xl`}>{store.ui.temporaryResult}</Text>
            </View>
          </View>
        )}

        <SectionList
          style={tw`flex-1`}
          contentContainerStyle={tw`p-3 flex-grow-1`}
          ref={listRef}
          sections={sections}
          keyExtractor={item => `${item.name}-${item.type}`}
          showsVerticalScrollIndicator
          persistentScrollbar
          ListEmptyComponent={
            <View style={tw`items-center justify-center flex-1`}>
              <Image source={inbox} style={tw`h-10`} resizeMode="contain" />
            </View>
          }
          renderSectionFooter={({section: {key}}) => {
            if (key !== 'favorites') {
              return null
            }
            return (
              <View style={tw`mt-2`}>
                {/* <View
                  style={tw`w-full border-b border-lightBorder dark:border-darkBorder`}
                /> */}
              </View>
            )
          }}
          renderItem={({item, index, section}) => {
            const finalIndex =
              !store.ui.query && section.key !== 'favorites'
                ? store.ui.favoriteItems.length + index
                : index
            return (
              <View
                key={index}
                style={tw.style(`flex-row items-center px-3 py-2 rounded`, {
                  'bg-highlight':
                    store.ui.selectedIndex === finalIndex &&
                    focused &&
                    !store.ui.temporaryResult,
                })}>
                {!!item.url && <FileIcon url={item.url} style={tw`w-4 h-4`} />}
                {item.type !== ItemType.CUSTOM && !!item.icon && (
                  <Text style={tw`text-xs`}>{item.icon}</Text>
                )}
                {item.type === ItemType.CUSTOM && (
                  <View
                    style={tw`h-4 w-4 bg-gray-800 rounded items-center justify-center`}>
                    <Image
                      // @ts-ignore
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
                {!!item.iconComponent && <item.iconComponent />}
                <Text
                  style={tw.style('ml-3 text-sm flex-1', {
                    'text-white':
                      store.ui.selectedIndex === finalIndex &&
                      focused &&
                      !store.ui.temporaryResult,
                  })}>
                  {item.name}
                </Text>
                {store.ui.selectedIndex === finalIndex &&
                  focused &&
                  section.key !== 'favorites' && (
                    <TouchableOpacity
                      onPress={() => {
                        store.ui.toggleFavorite(item)
                      }}>
                      <Image
                        source={
                          favorites[item.name] ? Assets.StarFilled : Assets.Star
                        }
                        style={tw.style('h-3 w-4', {
                          tintColor: 'white',
                        })}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  )}
                {section.key === 'favorites' && (
                  <Text
                    style={tw.style(
                      `text-gray-500 dark:text-gray-400 text-xs w-6`,
                      {
                        'text-white dark:text-white':
                          store.ui.selectedIndex === finalIndex &&
                          focused &&
                          !store.ui.temporaryResult,
                      },
                    )}>
                    ⌘ {index + 1}
                  </Text>
                )}
              </View>
            )
          }}
        />

        <View style={tw`absolute right-0 top-4`}>
          <Fade visible={store.ui.commandPressed} style={tw`flex-row`}>
            {/* {!!store.ui.query && (
              <>
                <Snack title="Translate" index={0} />
                <Snack title="Google" index={1} />
              </>
            )} */}

            {/* {!store.ui.query && (
              <>
                {FAVOURITES.map((fav, index) => (
                  <Snack key={index} title={fav.title} index={index} />
                ))}
              </>
            )} */}
          </Fade>
        </View>
      </>
    </View>
  )
})
