import {Dropdown} from 'components/Dropdown'
import {languages} from 'lib/languages'
import {observer} from 'mobx-react-lite'
import {Text, View} from 'react-native'
import {useStore} from 'store'

export const Translate = observer(() => {
  const store = useStore()

  return (
    <View className="flex-1 py-3 px-6">
      <View className="p-3 subBg rounded-lg border border-lightBorder dark:border-darkBorder gap-1">
        <Text className="text-xxs text">
          Select up to 3 languages for translation
        </Text>
        <View className="flex-row items-center py-2 z-20">
          <Text className="flex-1">First language</Text>

          <Dropdown
            className="w-40"
            value={store.ui.firstTranslationLanguage}
            onValueChange={v => store.ui.setFirstTranslationLanguage(v as any)}
            options={Object.values(languages).map(v => ({
              label: v.name,
              value: v.code,
            }))}
          />
        </View>
        <View className="flex-row items-center py-2 z-10">
          <Text className="flex-1">Second language</Text>

          <Dropdown
            className="w-40"
            value={store.ui.secondTranslationLanguage}
            onValueChange={v => store.ui.setSecondTranslationLanguage(v as any)}
            options={Object.values(languages).map((v, index) => ({
              label: v.name,
              value: v.code,
            }))}
          />
        </View>
        <View className="flex-row items-center py-2">
          <Text className="flex-1">Third language</Text>

          <Dropdown
            className="w-40"
            value={store.ui.thirdTranslationLanguage ?? ''}
            onValueChange={v => store.ui.setThirdTranslationLanguage(v as any)}
            options={Object.values(languages).map(v => ({
              label: v.name,
              value: v.code,
            }))}
          />
        </View>
      </View>
    </View>
  )
})
