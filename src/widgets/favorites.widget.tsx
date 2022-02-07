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
import spotifyLogo from '../assets/spotify.png'
import figma from '../assets/figma.png'
import notion from '../assets/notion.png'
import googleTranslate from '../assets/google_translate.png'
import todo from '../assets/todo.png'
import protonmail from '../assets/proton.png'
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
          <Text style={tw`ml-2 text-xs font-bold`}>Inbox</Text>
        </View>

        <View style={tw`flex-row items-center mr-2`}>
          <Image source={bf} style={tw`w-4 h-4`} resizeMode="contain" />
          <Text style={tw`ml-2 text-xs font-bold`}>BF Repo</Text>
        </View>
      </View>
    </View>
  )
})
