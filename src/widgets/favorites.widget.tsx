import {useBoolean} from 'hooks'
import React, {FC, useEffect, useRef} from 'react'
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

interface IProps {
  style?: StyleProp<ViewStyle>
}

export const FavoritesWidget: FC<IProps> = ({style}) => {
  useDeviceContext(tw)
  const [hovered, hoverOn, hoverOff] = useBoolean()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: hovered ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [hovered])

  const borderColor = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 0, 0, 0)', 'rgba(30, 92, 198,1)'],
  })

  return (
    <TouchableOpacity
      disabled
      // @ts-expect-error
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      style={tw.style(
        `p-3 bg-light dark:bg-dark rounded-lg border border-gray-100 dark:border-gray-600`,
        // @ts-ignore
        {
          borderColor,
        },
        style,
      )}>
      <Text style={tw`text-xs text-gray-400`}>Favorites</Text>
      <View style={{flexDirection: 'row', paddingVertical: 10}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 20,
          }}>
          <Image source={spotifyLogo} style={{height: 20, width: 20}} />
          <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
            Spotify
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 20,
          }}>
          <Image source={notion} style={{height: 20, width: 20}} />
          <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
            Notion
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 20,
          }}>
          <Image source={todo} style={{height: 20, width: 20}} />
          <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
            MS Todo
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 20,
          }}>
          <Image source={figma} style={{height: 20, width: 20}} />
          <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
            Figma
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 20,
          }}>
          <Image source={googleTranslate} style={{height: 20, width: 20}} />
          <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
            Translate
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
