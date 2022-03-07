import React, {FC} from 'react'
import {observer} from 'mobx-react-lite'
import {Image, StyleProp, Text, View, ViewStyle} from 'react-native'
import tw from 'tailwind'
import {useStore} from 'store'
import spotify from '../assets/spotify.png'

interface IProps {
  style?: StyleProp<ViewStyle>
}

export const GeneralWidget: FC<IProps> = observer(({style}) => {
  const store = useStore()

  return (
    <View
      style={tw.style(
        `px-6 py-2 text-gray-200 flex-row`,
        // @ts-ignore
        style,
      )}>
      {/* <Text style={tw`text-xs`}>🎵</Text> */}
      {/* <Image
        source={{uri: store.ui.track?.artwork}}
        style={tw`h-12 w-12 rounded-lg`}
      /> */}
      <Image source={spotify} style={tw`h-4 w-4`} />
      {store.ui.track?.title == null && (
        <Text style={tw`text-xs pl-2 font-medium`}>-</Text>
      )}
      <Text style={tw`text-xs pl-1 font-medium`}>
        {store.ui.track?.title} ·
      </Text>
      <Text style={tw`dark:text-gray-400 text-gray-600 text-xs pl-1`}>
        {store.ui.track?.artist}
      </Text>
      <View style={tw`flex-1`} />
      <Text style={tw`text-xs font-bold pl-1`}>{store.ui.currentTemp}°</Text>
      <Text style={tw`text-xs dark:text-gray-400 text-gray-600 pl-1`}>
        · {store.ui.nextHourForecast}
      </Text>
    </View>
  )
})
