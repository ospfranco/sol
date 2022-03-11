import {Fade} from 'components/Fade'
import {FileIcon} from 'components/FileIcon'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleProp,
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

interface IProps {
  style?: StyleProp<ViewStyle>
}

export const SearchWidget: FC<IProps> = observer(({style}) => {
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
    <View style={style}>
      <View style={tw`pt-2`}>
        <View
          style={tw.style(
            `px-3 pt-2 pb-3 flex-row border-b border-lightBorder dark:border-darkBorder`,
          )}>
          <TextInput
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            placeholder={`Type something...`}
            value={store.ui.query}
            onChangeText={store.ui.setQuery}
            ref={inputRef}
            style={tw`flex-1`}
            placeholderTextColor={tw.color('text-gray-500')}
          />
          {store.ui.isLoading && (
            <ActivityIndicator size="small" style={tw`w-2 h-2`} />
          )}
        </View>
      </View>

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
                style={tw.style(
                  `flex-row items-center px-3 py-2 rounded border border-transparent`,
                  {
                    'bg-highlight bg-opacity-50 dark:bg-gray-500 dark:bg-opacity-20 border-lightBorder dark:border-darkBorder ':
                      store.ui.selectedIndex === index && focused,
                  },
                )}>
                {!!item.url && <FileIcon url={item.url} style={tw`w-6 h-6`} />}
                {!!item.icon && <Text style={tw`text-lg`}>{item.icon}</Text>}
                {!!item.iconImage && (
                  <Image source={item.iconImage} style={tw`w-6 h-6`} />
                )}
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
