import { FC } from 'react'
import { View, Text, Image, ScrollView } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useStore } from 'store'
import { solNative } from 'lib/SolNative'
import { Assets } from 'assets'

export const Scripts: FC = observer(() => {
  const store = useStore()
  const username = solNative.userName()
  return (
    <ScrollView
      className="flex-1 h-full"
      contentContainerClassName="justify-center pb-5 px-5 -mt-4 gap-2"
    >
      <View className="flex-row items-center p-3 subBg rounded-lg border border-lightBorder dark:border-darkBorder mb-2">
        <Image
          source={Assets.terminal}
          className="h-8 w-8 mr-3"
          resizeMode="contain"
        />
        <View className="flex-1">
          <Text className="text-lg font-bold mb-1">Scripts</Text>
          <Text className="text-xxs text-neutral-500 dark:text-neutral-400">
            Scripts are located at <Text className="font-mono">/User/{username}/.config/sol/scripts</Text>.
          </Text>
          <Text className="text-xxs text-neutral-500 dark:text-neutral-400">
            Place your scripts in this folder to have them automatically picked up by Sol. Each script must contain two comments:
            # name: Script Name
            # icon: Emoji Icon
          </Text>
        </View>
      </View>
      <View className="z-20 p-3 subBg gap-3 rounded-lg border border-lightBorder dark:border-darkBorder">
        <Text className="text-base font-semibold mb-2">Detected Scripts:</Text>
        {store.scripts.scripts.length === 0 ? (
          <Text className="italic text-neutral-500">No scripts found.</Text>
        ) : (
          store.scripts.scripts.map(script => (
            <View key={script.id} className="mb-2 flex-row items-center">
              <Text className="mr-2">{script.icon}</Text>
              <Text className="font-mono mr-2">{script.name}</Text>
              <Text className="text-xs text-neutral-500">({script.id.replace('script-', '')})</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
})
