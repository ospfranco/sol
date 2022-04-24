import languages from 'lib/languages.json'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useRef } from 'react'
import {
  ActivityIndicator,
  Animated,
  Appearance,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle
} from 'react-native'
import { useStore } from 'store'
import tw from 'tailwind'
import { useDeviceContext } from 'twrnc'

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
      <View style={tw`pt-2`}>
        <Animated.View
          style={[
            tw`px-3 pt-2 pb-3 flex-row border-b border-lightBorder dark:border-darkBorder`,
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
            placeholder={`Type something...`}
            value={store.ui.query}
            onChangeText={store.ui.setQuery}
            style={tw`flex-1`}
            placeholderTextColor={tw.color('text-gray-500')}
          />
          {store.ui.isLoading && (
            <ActivityIndicator size="small" style={tw`w-2 h-2`} />
          )}
        </Animated.View>
      </View>

      {!!store.ui.translationResults && (
        <View style={tw`flex-1 p-3`}>
          <View style={tw`flex-1`}>
            <View
              style={tw.style(
                `flex-1 p-3 rounded flex-row items-center border border-transparent`,
                {
                  'bg-highlight bg-opacity-50 dark:bg-opacity-20 border-buttonBorder dark:border-darkBorder':
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
                  'bg-highlight bg-opacity-50 dark:bg-opacity-20 border-buttonBorder dark:border-darkBorder':
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
