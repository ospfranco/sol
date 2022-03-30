import {Fade} from 'components/Fade'
import {FileIcon} from 'components/FileIcon'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  Animated,
  Appearance,
  FlatList,
  Image,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {FAVOURITES, FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import inbox from '../assets/inbox.png'

const Snack = ({title, index}: {title: string; index: number}) => {
  useDeviceContext(tw)

  return (
    <View style={tw`flex-row items-center mr-4`}>
      <View
        style={tw`bg-gray-200 rounded dark:bg-highlightDark w-4 items-center justify-center`}>
        <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-medium`}>
          {index + 1}
        </Text>
      </View>
      <Text style={tw`text-xs text-gray-600 dark:text-gray-200 ml-2`}>
        {title}
      </Text>
    </View>
  )
}

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
    if (focused && store.ui.items.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 100,
      })
    }
  }, [focused, store.ui.items, store.ui.selectedIndex])

  return (
    <View style={style}>
      <View style={tw`pt-2`}>
        <Animated.View
          style={[
            tw`px-3 pt-2 pb-3 flex-row border-b border-lightBorder dark:border-darkBorder relative`,
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
            selectionColor="#0ea5e9"
            placeholderTextColor={tw.color('text-gray-500')}
            placeholder="Type something..."
          />
        </Animated.View>
      </View>

      <>
        {!!store.ui.temporaryResult && (
          <View style={tw`p-3`}>
            <View
              style={tw`border bg-highlight bg-opacity-50 dark:bg-gray-500 dark:bg-opacity-30 border-buttonBorder dark:border-darkBorder justify-center items-center rounded-lg p-3`}>
              <Text style={tw`text-xl`}>{store.ui.temporaryResult}</Text>
            </View>
          </View>
        )}

        <FlatList
          style={tw`flex-1`}
          contentContainerStyle={tw`p-3 flex-grow-1`}
          ref={listRef}
          data={store.ui.items}
          keyExtractor={item => item.name}
          showsVerticalScrollIndicator
          persistentScrollbar
          ListEmptyComponent={
            <View style={tw`items-center justify-center flex-1`}>
              <Image source={inbox} style={tw`h-10`} resizeMode="contain" />
            </View>
          }
          renderItem={({item, index}) => {
            return (
              <View
                key={index}
                style={tw.style(
                  `flex-row items-center px-3 py-2 rounded border border-transparent`,
                  {
                    'bg-highlight bg-opacity-50 dark:bg-gray-500 dark:bg-opacity-30 border-buttonBorder dark:border-darkBorder':
                      store.ui.selectedIndex === index &&
                      focused &&
                      !store.ui.temporaryResult,
                  },
                )}>
                {!!item.url && <FileIcon url={item.url} style={tw`w-4 h-4`} />}
                {!!item.icon && <Text style={tw`text-xs`}>{item.icon}</Text>}
                {!!item.iconImage && (
                  <Image source={item.iconImage} style={tw`w-4 h-4`} />
                )}
                {!!item.iconComponent && <item.iconComponent />}
                <Text style={tw.style('ml-3 text-sm')}>{item.name}</Text>
              </View>
            )
          }}
        />

        <View style={tw`absolute right-0 top-4`}>
          <Fade visible={store.ui.commandPressed} style={tw`flex-row`}>
            {!!store.ui.query && (
              <>
                <Snack title="Translate" index={0} />
                <Snack title="Google" index={1} />
              </>
            )}

            {!store.ui.query && (
              <>
                {FAVOURITES.map((fav, index) => (
                  <Snack key={index} title={fav.title} index={index} />
                ))}
              </>
            )}
          </Fade>
        </View>
      </>
    </View>
  )
})
