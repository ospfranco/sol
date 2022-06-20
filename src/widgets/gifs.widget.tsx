import {Assets} from 'assets'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect} from 'react'
import {Image, Text, TextInput, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const GifsWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  useEffect(() => {
    solNative.turnOnHorizontalArrowsListeners()
    return () => {
      solNative.turnOffHorizontalArrowsListeners()
    }
  }, [])

  useEffect(() => {
    store.ui.searchGifs()
  }, [store.ui.query])

  return (
    <View style={tw.style(`flex-1`, style)}>
      <View style={tw`h-10 pt-3 px-3 justify-center flex-row`}>
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          selectionColor={solNative.accentColor}
          placeholderTextColor={tw.color('dark:text-gray-400 text-gray-500')}
          placeholder="Search gifs..."
          style={tw`flex-1`}
        />
        <Image
          source={Assets.Giphy}
          style={tw`h-8 w-32`}
          resizeMode="contain"
        />
      </View>
      <View style={tw`flex-row flex-wrap px-3`}>
        {store.ui.gifs.map((gif, index) => {
          return (
            <View
              style={tw.style(`p-2 rounded border border-transparent`, {
                'bg-accent bg-opacity-50 dark:bg-opacity-40 border-accentDim':
                  index === store.ui.selectedIndex,
              })}>
              <Image
                source={{uri: gif.images.downsized.url}}
                style={tw.style(`w-31 h-31 rounded`)}
              />
            </View>
          )
        })}

        {!store.ui.gifs.length && (
          <Text style={tw`text-gray-500 dark:text-gray-400 text-xs`}>
            No results
          </Text>
        )}
      </View>
    </View>
  )
})
