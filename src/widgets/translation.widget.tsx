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
import {BackButton} from 'components/BackButton'
import {Widget} from 'stores/ui.store'

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
      <View className="flex-row items-center">
        <BackButton
          className="ml-3"
          onPress={() => store.ui.focusWidget(Widget.SEARCH)}
        />
        <MainInput placeholder="Translate..." />
      </View>

      {!store.ui.translationResults.length && (
        <View className="flex-1 p-3 items-center justify-center">
          <Text className="text-xs text-neutral-500 dark:text-neutral-300">
            Translating...
          </Text>
        </View>
      )}

      {!!store.ui.translationResults.length && (
        <View className="flex-1">
          <View
            className={clsx(
              'flex-1 p-3 m-2 flex-row items rounded border-transparent',
              {
                highlight: index === 0,
              },
            )}>
            <Text className="flex-1 pt-2 text">
              {store.ui.translationResults[0]}
            </Text>
            <Text className="text-3xl">
              {/* @ts-ignore */}
              {languages[store.ui.firstTranslationLanguage]?.flag ??
                store.ui.firstTranslationLanguage}
            </Text>
          </View>

          <View
            className={clsx(
              'flex-1 p-3 m-2 flex-row items rounded border-transparent',
              {
                highlight: index === 1,
              },
            )}>
            <Text className="flex-1 pt-2 text">
              {store.ui.translationResults[1]}
            </Text>
            <Text className="text-3xl">
              {/* @ts-ignore */}
              {languages[store.ui.secondTranslationLanguage]?.flag ??
                store.ui.secondTranslationLanguage}
            </Text>
          </View>

          {!!store.ui.thirdTranslationLanguage && (
            <View
              className={clsx(
                'flex-1 p-3 m-2 flex-row items rounded border-transparent bg-accentFaint',
                {
                  highlight: index === 2,
                },
              )}>
              <Text className="flex-1 pt-2 text">
                {store.ui.translationResults[2]}
              </Text>
              <Text className="text-3xl">
                {/* @ts-ignore */}
                {languages[store.ui.thirdTranslationLanguage]?.flag ??
                  store.ui.thirdTranslationLanguage}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
})
