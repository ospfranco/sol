import {LoadingBar} from 'components/LoadingBar'
import {useFullSize} from 'hooks/useFullSize'
import {languages} from 'lib/languages'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {
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
  useFullSize()
  const store = useStore()
  const colorScheme = Appearance.getColorScheme()

  return (
    <View className="flex-1" style={style}>
      <View className="h-12 pt-1 px-3 dark:bg-neutral-900 flex-row items-center">
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          style={tw.style(`flex-1 text-lg`)}
          placeholderTextColor={
            colorScheme === 'dark'
              ? tw.color('text-neutral-700')
              : tw.color('text-neutral-400')
          }
          placeholder={'Enter translation query...'}
          selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
        />
      </View>

      <LoadingBar />

      {!store.ui.translationResults.length && (
        <View className="flex-1 p-3 items-center justify-center">
          <Text className="text-xs text-neutral-500">Translating...</Text>
        </View>
      )}

      {!!store.ui.translationResults.length && (
        <View className="flex-1 p-3 flex-row">
          <View
            style={tw.style('flex-1 p-3 rounded border border-transparent', {
              'bg-gray-200 dark:bg-proGray-900 border-gray-300 dark:border-neutral-700':
                store.ui.selectedIndex === 0,
            })}>
            <Text className="text-3xl">
              {/* @ts-ignore */}
              {languages[store.ui.firstTranslationLanguage]?.flag ??
                store.ui.firstTranslationLanguage}
            </Text>
            <Text className="flex-1 pt-2 text-base">
              {store.ui.translationResults[0]}
            </Text>
          </View>

          <View
            style={tw.style('flex-1 p-3 rounded border border-transparent', {
              'bg-gray-200 dark:bg-proGray-900 border-gray-300 dark:border-neutral-700':
                store.ui.selectedIndex === 1,
            })}>
            <Text style={tw`text-3xl`}>
              {/* @ts-ignore */}
              {languages[store.ui.secondTranslationLanguage]?.flag ??
                store.ui.secondTranslationLanguage}
            </Text>
            <Text className="flex-1 pt-2 text-base">
              {store.ui.translationResults[1]}
            </Text>
          </View>

          {!!store.ui.thirdTranslationLanguage && (
            <View
              style={tw.style('flex-1 p-3 rounded border border-transparent', {
                'bg-gray-200 dark:bg-proGray-900 border-gray-300 dark:border-neutral-700':
                  store.ui.selectedIndex === 2,
              })}>
              <Text style={tw`text-3xl`}>
                {/* @ts-ignore */}
                {languages[store.ui.thirdTranslationLanguage]?.flag ??
                  store.ui.thirdTranslationLanguage}
              </Text>
              <Text className="flex-1 pt-2 text-base">
                {store.ui.translationResults[2]}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
})
