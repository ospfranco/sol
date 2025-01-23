import {Assets} from 'assets'
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
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {useStore} from 'store'
import {ItemType} from 'stores/ui.store'
import packageInfo from '../../../package.json'

export const About = observer(() => {
  const store = useStore()

  return (
    <View className="flex-1 justify-center items-center gap-10 flex-row">
      <Image
        source={Assets.Logo}
        style={{
          height: 180,
          width: 180,
          tintColor: store.ui.isDarkMode ? 'white' : 'black',
        }}
      />
      <View className="gap-2">
        <Text className="text-3xl">Sol</Text>
        <Text className="font-semibold">{packageInfo.version}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="">built by</Text>
          <Image source={Assets.OSP} className="h-6 w-6 rounded-full" />
          <Text className="">ospfranco</Text>
        </View>
        <TouchableOpacity
          className="bg-blue-500 p-2 rounded justify-center items-center"
          onPress={() => {
            Linking.openURL('https://sol.ospfranco.com/')
          }}>
          <Text className="text-white">Website</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})
