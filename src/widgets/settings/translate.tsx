import clsx from 'clsx'
import {Dropdown} from 'components/Dropdown'
import {FileIcon} from 'components/FileIcon'
import {MyRadioButton} from 'components/MyRadioButton'
import {MySwitch} from 'components/MySwitch'
import {useFullSize} from 'hooks/useFullSize'
import {languages} from 'lib/languages'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import {FC, useState} from 'react'
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {useStore} from 'store'
import {ItemType} from 'stores/ui.store'

export const Translate = observer(() => {
  const store = useStore()

  return (
    <View className="flex-1 p-6">
      <View className="flex-1 pt-8">
        <View className="flex-row items-center py-2 z-20">
          <Text className="flex-1 text-right mr-2">First language</Text>
          <View className="flex-1">
            <Dropdown
              className="w-40"
              value={store.ui.firstTranslationLanguage}
              onValueChange={v =>
                store.ui.setFirstTranslationLanguage(v as any)
              }
              options={Object.values(languages).map(v => ({
                // @ts-expect-error
                label: `${v.name} ${v.flag ?? ''}`,
                value: v.code,
              }))}
            />
          </View>
        </View>
        <View className="flex-row items-center py-2 z-10">
          <Text className="flex-1 text-right mr-2">Second language</Text>
          <View className="flex-1">
            <Dropdown
              className="w-40"
              value={store.ui.secondTranslationLanguage}
              onValueChange={v =>
                store.ui.setSecondTranslationLanguage(v as any)
              }
              options={Object.values(languages).map((v, index) => ({
                // @ts-expect-error
                label: `${v.name} ${v.flag ?? ''}`,
                value: v.code,
              }))}
            />
          </View>
        </View>
        <View className="flex-row items-center py-2">
          <Text className="flex-1 text-right mr-2">Third language</Text>
          <View className="flex-1">
            <Dropdown
              className="w-40"
              value={store.ui.thirdTranslationLanguage ?? ''}
              onValueChange={v =>
                store.ui.setThirdTranslationLanguage(v as any)
              }
              options={Object.values(languages).map(v => ({
                // @ts-expect-error
                label: `${v.name} ${v.flag ?? ''}`,
                value: v.code,
              }))}
            />
          </View>
        </View>
      </View>
    </View>
  )
})
