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
}

export const WeatherWidget: FC<IProps> = ({style}) => {
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
      <Text style={tw`text-xs text-gray-400`}>Weather</Text>

      <View style={tw`pt-3`}>
        <Text style={tw`font-medium dark:text-white text-lg`}>20 ℃</Text>
        <Text style={tw`text-sm text-gray-500 dark:text-gray-400`}>
          80% Chance of rain
        </Text>
        <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
          Munich - Harlaching
        </Text>
      </View>
      <View style={{flex: 1}} />

      {/* <Animated.View
        style={tw.style(
          `border-blue-400 bg-transparent border rounded-lg absolute inset-0`,
          {
            opacity: fadeAnim,
          },
        )}
      /> */}
    </TouchableOpacity>
  )
}
