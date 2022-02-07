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
    outputRange: ['rgba(100, 100, 100, 1)', 'rgba(30, 92, 198, 1)'],
  })

  return (
    <View
      style={tw`flex-1 border rounded-lg bg-light dark:bg-dark dark:border-gray-800`}>
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
                style={tw`flex-row items-center mr-4 border-gray-600 rounded`}>
                <Image source={googleTranslate} style={tw`w-6 h-6`} />
                <View style={tw`flex-row px-1 ml-2 bg-gray-600 rounded`}>
                  <Text style={tw`text-xs font-bold`}>⌘</Text>
                </View>
                <View style={tw`flex-row px-1 ml-1 bg-gray-600 rounded`}>
                  <Text style={tw`text-xs font-bold`}>1</Text>
                </View>
              </View>

              <View style={tw`flex-row items-center border-gray-600 rounded`}>
                <Text>✅</Text>
                {/* <Image source={googleTranslate} style={tw`w-6 h-6`} /> */}
                <View style={tw`flex-row px-1 ml-2 bg-gray-600 rounded`}>
                  <Text style={tw`text-xs font-bold`}>⌘</Text>
                </View>
                <View style={tw`flex-row px-1 ml-1 bg-gray-600 rounded`}>
                  <Text style={tw`text-xs font-bold`}>2</Text>
                </View>
              </View>
            </View>
          )}

          <FlatList
            style={tw`flex-1`}
            contentContainerStyle={tw`p-3`}
            ref={listRef}
            data={store.ui.items}
            keyExtractor={item => item.name}
            showsVerticalScrollIndicator
            persistentScrollbar
            renderItem={({item, index}) => {
              return (
                <View
                  key={index}
                  style={tw.style(`flex-row items-center px-2 py-1 rounded`, {
                    'dark:bg-gray-600':
                      store.ui.selectedIndex === index && focused,
                  })}>
                  {!!item.url && (
                    <FileIcon url={item.url} style={tw`w-6 h-6`} />
                  )}
                  {!!item.icon && <Text style={tw`text-lg`}>{item.icon}</Text>}
                  <Text style={tw`ml-3`}>{item.name}</Text>
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
                'bg-blue-500': store.ui.selectedIndex === 0,
              })}>
              <Text style={tw`flex-1 pt-2 text-lg`}>
                {store.ui.translationResults.en}
              </Text>
              <Text>🇺🇸</Text>
            </View>
          </View>
          <View style={tw`flex-1 pl-2`}>
            <View
              style={tw.style(`flex-1 p-3 rounded`, {
                'bg-blue-500 dark:bg-blue-700': store.ui.selectedIndex === 1,
              })}>
              <Text style={tw`flex-1 pt-2 text-lg`}>
                {store.ui.translationResults.de}
              </Text>
              <Text>🇩🇪</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
})
