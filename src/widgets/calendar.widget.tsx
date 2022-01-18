import {useBoolean} from 'hooks'
import React, {FC, useEffect, useRef} from 'react'
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface IProps {
  style?: StyleProp<ViewStyle>
  focused?: boolean
}

export const CalendarWidget: FC<IProps> = ({style}) => {
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
        `p-3 bg-light dark:bg-dark rounded-lg border border-gray-100 dark:border-gray-600 w-[180px]`,
        // @ts-ignore
        {
          borderColor,
        },
        style,
      )}>
      <TouchableOpacity style={tw`flex-1`}>
        <Text style={tw`text-xs text-gray-400`}>Calendar</Text>
        <View style={tw`pt-3`}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-2 h-2 mr-2 bg-red-500 rounded-full`} />
            <Text style={tw`font-medium dark:text-white`}>
              C-Levels Monthly
            </Text>
          </View>
          <Text style={tw`text-sm dark:text-gray-400`}>20 Mins.</Text>
        </View>
        <View style={{flex: 1}} />
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            textAlign: 'right',
            color: '#1e5cc6',
          }}>
          Join →
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}
