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

interface IProps {}

const Snack = ({title}: {title: string}) => {
  return (
    <View
      style={tw`flex-row items-center px-3 py-1 mr-1 rounded shadow dark:bg-gray-800`}>
      <Text style={tw`text-xs dark:text-gray-400`}>{title}</Text>
    </View>
  )
}

export const SearchWidget: FC<IProps> = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  const focused = store.ui.focusedWidget === FocusableWidget.SEARCH
  const inputRef = useRef<TextInput | null>(null)
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    if (focused && store.ui.items.length) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 100,
      })
    }
  }, [focused, store.ui.items, store.ui.selectedIndex])

  return (
    <View
      style={tw`flex-1 border border-gray-200 rounded-lg bg-light dark:bg-dark dark:border-gray-800`}>
      <View style={tw`pt-2`}>
        <View style={tw.style(`px-3 py-2 flex-row`)}>
          <TextInput
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            placeholder="Type something..."
            value={store.ui.query}
            onChangeText={store.ui.setQuery}
            ref={inputRef}
            style={tw`flex-1 text-base`}
          />
          {store.ui.isLoading && (
            <ActivityIndicator size="small" style={tw`w-2 h-2`} />
          )}
        </View>
      </View>

      {!store.ui.translationResults && (
        <>
          {!!store.ui.query && (
            <View style={tw`flex-row px-3 py-2 `}>
              <Snack title="Translate" />
              <Snack title="Add todo" />
              <Snack title="Google it" />
            </View>
          )}

          {!store.ui.query && (
            <View style={tw`flex-row px-3 py-2 `}>
              <Snack title="Protonmail" />
              <Snack title="BodyFast" />
              <Snack title="Twitter" />
              <Snack title="Productlane" />
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
                    'bg-gray-500 bg-opacity-50':
                      store.ui.selectedIndex === index && focused,
                  })}>
                  {!!item.url && (
                    <FileIcon url={item.url} style={tw`w-6 h-6`} />
                  )}
                  {!!item.icon && <Text style={tw`text-lg`}>{item.icon}</Text>}
                  <Text
                    style={tw.style(`ml-3 text-sm dark:text-gray-400`, {
                      'dark:text-white':
                        store.ui.selectedIndex === index && focused,
                    })}>
                    {item.name}
                  </Text>
                </View>
              )
            }}
          />
        </>
      )}

      {!!store.ui.translationResults && (
        <View style={tw`flex-1 p-3`}>
          <View style={tw`flex-1 pr-2`}>
            <View
              style={tw.style(`flex-1 p-3 rounded`, {
                'bg-gray-500 bg-opacity-50': store.ui.selectedIndex === 0,
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
                'bg-gray-500 bg-opacity-50': store.ui.selectedIndex === 1,
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
