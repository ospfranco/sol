import languages from 'lib/languages.json'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  ActivityIndicator,
  Animated,
  Appearance,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: StyleProp<ViewStyle>
}

export const TranslationWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const colorScheme = Appearance.getColorScheme()
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

  return (
    <View
      style={tw.style(
        `flex-1`,
        //@ts-ignore
        style,
      )}>
      <View style={tw`pt-3 px-3 pb-1 flex-row`}>
        <TextInput
          autoFocus
          // @ts-ignore
          enableFocusRing={false}
          placeholder={`Type something...`}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          style={tw`flex-1`}
          placeholderTextColor={tw.color('text-gray-500')}
        />
        {store.ui.isLoading && (
          <ActivityIndicator size="small" style={tw`w-2 h-2`} />
        )}
      </View>

      {!!store.ui.translationResults && (
        <View style={tw`flex-1 p-3`}>
          <View style={tw`flex-1`}>
            <View
              style={tw.style(
                `flex-1 p-3 rounded flex-row items-center border border-transparent`,
                {
                  'bg-accent bg-opacity-50 dark:bg-opacity-20 border-buttonBorder dark:border-darkBorder':
                    store.ui.selectedIndex === 0,
                },
              )}>
              <Text style={tw`flex-1 pt-2 text-base`}>
                {store.ui.translationResults.en}
              </Text>
              <Text style={tw`text-3xl`}>
                {/* @ts-ignore */}
                {languages[store.ui.firstTranslationLanguage]?.flag}
              </Text>
            </View>
          </View>
          <View style={tw`flex-1`}>
            <View
              style={tw.style(
                `flex-1 p-3 rounded flex-row items-center border border-transparent`,
                {
                  'bg-accent bg-opacity-50 dark:bg-opacity-20 border-buttonBorder dark:border-darkBorder':
                    store.ui.selectedIndex === 1,
                },
              )}>
              <Text style={tw`flex-1 pt-2 text-base`}>
                {store.ui.translationResults.de}
              </Text>
              <Text style={tw`text-3xl`}>
                {/* @ts-ignore */}
                {languages[store.ui.secondTranslationLanguage]?.flag}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
})
