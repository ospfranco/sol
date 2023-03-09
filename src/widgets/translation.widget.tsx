import clsx from 'clsx'
import {LoadingBar} from 'components/LoadingBar'
import {useFullSize} from 'hooks/useFullSize'
import {languages} from 'lib/languages'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect} from 'react'
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
import colors from 'tailwindcss/colors'
import customColors from '../colors'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: StyleProp<ViewStyle>
}

export const TranslationWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  useFullSize()
  const store = useStore()
  const colorScheme = Appearance.getColorScheme()

  useEffect(() => {
    solNative.turnOnHorizontalArrowsListeners()

    return () => {
      solNative.turnOffHorizontalArrowsListeners()
    }
  }, [])

  const index = store.ui.selectedIndex

  return (
    <View className="flex-1" style={style}>
      <View className="my-5 px-4 flex-row items-center">
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          className="flex-1 text-xl font-light"
          placeholderTextColor={
            colorScheme === 'dark' ? colors.neutral[500] : colors.neutral[400]
          }
          placeholder={'Enter text to translate...'}
          selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
        />
      </View>

      <LoadingBar />

      {!store.ui.translationResults.length && (
        <View className="flex-1 p-3 items-center justify-center">
          <Text className="text-xs text-neutral-500 dark:text-neutral-300">
            Translating...
          </Text>
        </View>
      )}

      {!!store.ui.translationResults.length && (
        <View className="flex-1 flex-row">
          <View
            className={clsx('flex-1 p-3 border-b-4 border-transparent')}
            style={{
              backgroundColor: index === 0 ? customColors.accentBg : undefined,
              borderBottomColor:
                index === 0 ? customColors.accent : 'transparent',
            }}>
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
            className={clsx('flex-1 p-3 border-b-4 border-transparent')}
            style={{
              backgroundColor: index === 1 ? customColors.accentBg : undefined,
              borderBottomColor:
                index === 1 ? customColors.accent : 'transparent',
            }}>
            <Text className="text-3xl">
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
              className={clsx(
                'flex-1 p-3 border-b-4 border-transparent bg-accentFaint',
              )}
              style={{
                backgroundColor:
                  index === 2 ? customColors.accentBg : undefined,
                borderBottomColor:
                  index === 2 ? customColors.accent : 'transparent',
              }}>
              <Text className="text-3xl">
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
