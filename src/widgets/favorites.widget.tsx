import {useBoolean} from 'hooks'
import React, {FC, useRef} from 'react'
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  StyleProp,
  ViewStyle,
  Image,
} from 'react-native'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import protonmail from '../assets/proton.png'
import twitter from '../assets/twitter.jpeg'
import bf from '../assets/bf.png'
import {observer} from 'mobx-react-lite'
import {useStore} from 'store'

interface IProps {
  style?: any
}

export const FavoritesWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  return (
    <View
      style={tw.style(
        `p-3 bg-light dark:bg-dark rounded-lg border border-gray-100 dark:border-gray-600`,
        style,
      )}>
      {!store.ui.minimalistMode && (
        <Text style={tw`text-xs text-gray-400`}>Favorites</Text>
      )}
      <View style={tw`flex-row`}>
        <View style={tw`flex-row items-center mr-4`}>
          <Image source={protonmail} style={tw`w-4 h-4`} resizeMode="contain" />
          <Text style={tw`ml-1 text-xs `}>Inbox</Text>
        </View>

        <View style={tw`flex-row items-center mr-4`}>
          <Image source={bf} style={tw`w-4 h-4`} resizeMode="contain" />
          <Text style={tw`ml-1 text-xs `}>BF Repo</Text>
        </View>

        <View style={tw`flex-row items-center mr-4`}>
          <Image source={twitter} style={tw`w-4 h-4`} resizeMode="contain" />
          <Text style={tw`ml-1 text-xs `}>Twitter</Text>
        </View>
      </View>
    </View>
  )
})
