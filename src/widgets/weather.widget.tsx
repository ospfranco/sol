import {useBoolean} from 'hooks'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface IProps {
  style?: StyleProp<ViewStyle>
}

export const WeatherWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  return (
    <View
      style={tw.style(
        `p-3 bg-light dark:bg-dark rounded-lg border border-gray-100 dark:border-gray-800 w-[180px]`,
        // @ts-ignore
        style,
      )}>
      {!store.ui.minimalistMode && (
        <Text style={tw`pb-3 text-xs text-gray-400`}>Weather</Text>
      )}

      <Text style={tw`text-4xl font-medium dark:text-white`}>
        {store.ui.currentTemp}
        <Text style={tw`text-lg text-gray-500`}>℃</Text>
      </Text>
      <View style={{flex: 1}} />
      <Text style={tw`text-sm text-right text-gray-500 dark:text-gray-400`}>
        {store.ui.nextHourForecast}
      </Text>

      {/* <Animated.View
        style={tw.style(
          `border-blue-400 bg-transparent border rounded-lg absolute inset-0`,
          {
            opacity: fadeAnim,
          },
        )}
      /> */}
    </View>
  )
})
