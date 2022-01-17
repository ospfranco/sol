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

export const TodosWidget: FC<IProps> = ({style}) => {
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
        `p-3 bg-light dark:bg-dark rounded-lg border border-gray-100 dark:border-gray-600 flex-1`,
        // @ts-ignore
        {
          borderColor,
        },
        style,
      )}>
      <Text style={tw`text-xs text-gray-400`}>Todos</Text>

      <View style={{paddingVertical: 5}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 3,
              height: 15,
              width: 15,
              borderColor: '#444',
              marginVertical: 5,
            }}
          />
          <Text style={{marginLeft: 10}}>Do the important thing</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 3,
              height: 15,
              width: 15,
              borderColor: '#444',
              marginVertical: 5,
            }}
          />
          <Text style={{marginLeft: 10}}>Take clothes to laundry</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 3,
              height: 15,
              width: 15,
              borderColor: '#444',
              marginVertical: 5,
            }}
          />
          <Text style={{marginLeft: 10}}>Renovate expired certificates</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
