import {FileIcon} from 'components/FileIcon'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  View,
} from 'react-native'
import {useStore} from 'store'
import {FAVOURITES, FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import inbox from '../assets/inbox.png'

interface IProps {}

const Snack = ({title, index}: {title: string; index: number}) => {
  useDeviceContext(tw)

  return (
    <View style={tw`flex-row items-center mr-4`}>
      {/* <View
        style={tw`bg-gray-200 rounded dark:bg-highlightDark w-4 items-center justify-center`}>
        <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-medium`}>
          {index + 1}
        </Text>
      </View> */}
      <Text style={tw`text-xs text-gray-600 dark:text-gray-500 ml-2`}>
        {title}
      </Text>
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
    <View style={tw`flex-1`}>
      <View style={tw`pt-2`}>
        <View
          style={tw.style(
            `px-3 py-3 flex-row border-b border-gray-300 dark:border-gray-800`,
          )}>
          <TextInput
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            placeholder={`Currently ${store.ui.currentTemp} ℃ → ${store.ui.nextHourForecast}`}
            value={store.ui.query}
            onChangeText={store.ui.setQuery}
            ref={inputRef}
            style={tw`flex-1`}
          />
          {store.ui.isLoading && (
            <ActivityIndicator size="small" style={tw`w-2 h-2`} />
          )}
        </View>
      </View>

      {!store.ui.translationResults && (
        <>
          {!!store.ui.temporaryResult && (
            <Text
              style={tw`px-3 py-6 text-xl text-center bg-gray-200 my-4 dark:bg-highlightDark`}>
              {store.ui.temporaryResult}
            </Text>
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
                  style={tw.style(`flex-row items-center px-3 py-2 rounded`, {
                    'bg-highlight dark:bg-highlightDark':
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

          <View style={tw`absolute right-0 top-5 flex-row`}>
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
          </View>
        </>
      )}

      {!!store.ui.translationResults && (
        <View style={tw`flex-1 p-3`}>
          <View style={tw`flex-1`}>
            <View
              style={tw.style(`flex-1 p-3 rounded flex-row items-center`, {
                'bg-highlight dark:bg-highlightDark':
                  store.ui.selectedIndex === 0,
              })}>
              <Text style={tw`flex-1 h-full pt-2 text-lg`}>
                {store.ui.translationResults.en}
              </Text>
              <Text style={tw`text-3xl`}>🇬🇧</Text>
            </View>
          </View>
          <View style={tw`flex-1`}>
            <View
              style={tw.style(`flex-1 p-3 rounded flex-row items-center`, {
                'bg-highlight dark:bg-highlightDark':
                  store.ui.selectedIndex === 1,
              })}>
              <Text style={tw`flex-1 pt-2 text-lg h-full`}>
                {store.ui.translationResults.de}
              </Text>
              <Text style={tw`text-3xl`}>🇩🇪</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
})
