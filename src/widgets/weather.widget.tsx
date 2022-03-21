import {Input} from 'components/Input'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface IProps {
  style?: ViewStyle
}

export const WeatherWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  return (
    <View style={tw.style(`flex-1 items-center p-6 justify-center`, style)}>
      <View style={tw`w-92`}>
        <Text style={tw`font-bold`}>Weather configuration</Text>
        <Text style={tw`pt-4`}>OpenWeatherMap Api Key</Text>
        <View
          style={tw`w-full rounded border border-gray-500 dark:border-gray-700 bg-transparent px-2 py-2 mt-4`}>
          <Input
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            value={store.ui.weatherApiKey}
            onChangeText={store.ui.setWeatherApiKey}
            placeholder="Api key..."
          />
        </View>
        <Text style={tw`pt-4`}>Latitude</Text>
        <View
          style={tw`w-full rounded border border-gray-500 dark:border-gray-700 bg-transparent px-2 py-2 mt-4`}>
          <Input
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            value={store.ui.weatherLat}
            onChangeText={store.ui.setWeatherLat}
            placeholder="Latitude..."
            style={tw`w-full`}
          />
        </View>
        <Text style={tw`pt-4`}>Longitude</Text>
        <View
          style={tw`w-full rounded border border-gray-500 dark:border-gray-700 bg-transparent px-2 py-2 mt-4`}>
          <Input
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            value={store.ui.weatherLon}
            onChangeText={store.ui.setWeatherLon}
            placeholder="Longitude..."
            style={tw`w-full`}
          />
        </View>
      </View>
    </View>
  )
})
