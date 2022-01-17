import {useBoolean} from 'hooks'
import React, {useEffect, useRef} from 'react'
import {TouchableOpacity, Text, View, Animated} from 'react-native'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

export const CalendarWidget = () => {
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
      )}>
      <Text style={tw`text-xs text-gray-400`}>Calendar</Text>

      <View style={tw`pt-3`}>
        <View style={tw`flex-row items-center`}>
          <View style={tw`h-2 w-2 rounded-full bg-red-500 mr-2`} />
          <Text style={tw`font-medium dark:text-white`}>C-Levels Monthly</Text>
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
