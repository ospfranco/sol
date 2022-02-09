import {FileIcon} from 'components/FileIcon'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Text,
  TextInput,
  View,
} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import googleTranslate from '../assets/google_translate.png'

interface IProps {}

export const SearchWidget: FC<IProps> = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  const focused = store.ui.focusedWidget === FocusableWidget.SEARCH
  const fadeAnim = useRef(new Animated.Value(1)).current
  const inputRef = useRef<TextInput | null>(null)
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    // if (focused) {
    //   inputRef.current?.setNativeProps({editable: true})
    //   inputRef.current?.focus()
    //   // Promise.resolve().then(() => {
    //   //   inputRef.current?.focus()
    //   // })
    // } else {
    //   // blur() does not work, the workaround is to completely disable the input
    //   // https://github.com/microsoft/react-native-macos/issues/913
    //   // inputRef.current?.blur()
    //   inputRef.current?.setNativeProps({editable: false})
    // }

    Animated.timing(fadeAnim, {
      toValue: focused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [focused])

  useEffect(() => {
    if (focused && store.ui.items.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 100,
      })
    }
  }, [focused, store.ui.items, store.ui.selectedIndex])

  const borderColor = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(100, 100, 100)', 'rgb(0, 142, 255)'],
  })

  return (
    <View
      style={tw`flex-1 border border-gray-200 rounded-lg bg-light dark:bg-dark dark:border-gray-800`}>
      <View style={tw`py-2`}>
        <Animated.View
          style={tw.style(
            `px-3 py-2 border-b flex-row`,
            // @ts-ignore
            {
              borderColor,
            },
          )}>
          <TextInput
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            placeholder="Type something..."
            value={store.ui.query}
            onChangeText={store.ui.setQuery}
            ref={inputRef}
            style={tw`flex-1`}
          />
          {store.ui.isLoading && (
            <ActivityIndicator size="small" style={tw`w-2 h-2`} />
          )}
        </Animated.View>
      </View>

      {!store.ui.translationResults && (
        <>
          {!!store.ui.query && (
            <View style={tw`flex-row p-3`}>
              <View
                style={tw`flex-row items-center px-3 py-1 mr-4 rounded shadow-sm dark:bg-gray-800`}>
                <Text style={tw`text-xs dark:text-gray-500`}>Translate</Text>
              </View>

              <View
                style={tw`flex-row items-center px-3 py-1 mr-4 rounded shadow-sm dark:bg-gray-800`}>
                <Text style={tw`text-xs dark:text-gray-500`}>Add Todo</Text>
              </View>

              <View
                style={tw`flex-row items-center px-3 py-1 mr-4 rounded shadow-sm dark:bg-gray-800`}>
                <Text style={tw`text-xs dark:text-gray-500`}>Google</Text>
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
                <Text style={tw`text-gray-200 dark:text-gray-500`}>
                  No results
                </Text>
              </View>
            }
            renderItem={({item, index}) => {
              return (
                <View
                  key={index}
                  style={tw.style(`flex-row items-center px-2 py-2 rounded`, {
                    'bg-gray-200 dark:bg-gray-600':
                      store.ui.selectedIndex === index && focused,
                  })}>
                  {!!item.url && (
                    <FileIcon url={item.url} style={tw`w-6 h-6`} />
                  )}
                  {!!item.icon && <Text style={tw`text-lg`}>{item.icon}</Text>}
                  <Text style={tw`ml-3 text-sm`}>{item.name}</Text>
                </View>
              )
            }}
          />
        </>
      )}

      {!!store.ui.translationResults && (
        <View style={tw`flex-row flex-1 p-3`}>
          <View style={tw`flex-1 pr-2`}>
            <View
              style={tw.style(`flex-1 p-3 rounded`, {
                'bg-gray-200 dark:bg-gray-700': store.ui.selectedIndex === 0,
              })}>
              <Text>🇺🇸</Text>
              <Text style={tw`flex-1 pt-2 text-lg`}>
                {store.ui.translationResults.en}
              </Text>
            </View>
          </View>
          <View style={tw`flex-1 pl-2`}>
            <View
              style={tw.style(`flex-1 p-3 rounded`, {
                'bg-gray-200 dark:bg-gray-700': store.ui.selectedIndex === 1,
              })}>
              <Text>🇩🇪</Text>
              <Text style={tw`flex-1 pt-2 text-lg`}>
                {store.ui.translationResults.de}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
})
