import clsx from 'clsx'
import {MainInput} from 'components/MainInput'
import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {languages} from 'lib/languages'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect} from 'react'
import {StyleProp, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import customColors from '../colors'

interface Props {
  style?: StyleProp<ViewStyle>
  className?: string
}

export const TranslationWidget: FC<Props> = observer(({style}) => {
  useFullSize()
  const store = useStore()

  useEffect(() => {
    solNative.turnOnHorizontalArrowsListeners()

    return () => {
      solNative.turnOffHorizontalArrowsListeners()
    }
  }, [])

  const index = store.ui.selectedIndex

  return (
    <View className="flex-1" style={style}>
      <MainInput placeholder="Translate..." />

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
