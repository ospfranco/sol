import {Assets} from 'assets'
import {Input} from 'components/Input'
import {observer} from 'mobx-react-lite'
import React, {FC, useState} from 'react'
import {
  Appearance,
  Button,
  Image,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

type ITEM = 'ABOUT' | 'WEATHER'

interface SelectableButtonProps extends TouchableOpacityProps {
  selected: boolean
  title: string
  style?: ViewStyle
}

const SelectableButton: FC<SelectableButtonProps> = ({
  selected,
  title,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      {...props}
      style={tw.style(
        'rounded px-3 py-1 w-full',
        {
          'bg-gray-200 dark:bg-highlightDark': selected,
        },
        style,
      )}>
      <Text style={tw`font-medium`}>{title}</Text>
    </TouchableOpacity>
  )
}

export const SettingsWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  const colorScheme = Appearance.getColorScheme()
  useDeviceContext(tw)
  const [selected, setSelected] = useState<ITEM>('WEATHER')

  return (
    <View style={tw.style(`flex-1 flex-row`, style)}>
      <View
        style={tw`p-4 w-44 border-r border-lightBorder dark:border-darkBorder`}>
        <TouchableOpacity
          onPress={() => {
            store.ui.focusWidget(FocusableWidget.SEARCH)
          }}>
          <Text style={tw`text-lg font-medium`}>← Settings</Text>
        </TouchableOpacity>
        <SelectableButton
          title="Weather"
          selected={selected === 'WEATHER'}
          style={tw`mt-3`}
          onPress={() => setSelected('WEATHER')}
        />
        <SelectableButton
          title="About"
          selected={selected === 'ABOUT'}
          style={tw`mt-1`}
          onPress={() => setSelected('ABOUT')}
        />
      </View>
      {selected === 'ABOUT' && (
        <View
          style={tw`flex-1 flex-row justify-center items-center bg-white dark:bg-black bg-opacity-30`}>
          <Image
            source={Assets.Logo}
            style={tw.style(`h-32 w-32`, {
              tintColor: colorScheme === 'dark' ? 'white' : 'black',
            })}
          />
          <View style={tw`pl-3`}>
            <Text style={tw`font-thin text-3xl`}>SOL</Text>
            <Text style={tw``}>Beta Version</Text>
            <Text style={tw`text-xs pt-2`}>Oscar Franco</Text>
            <Text style={tw`text-xs`}>All rights reserved 2022</Text>
          </View>
        </View>
      )}
      {selected === 'WEATHER' && (
        <View style={tw`flex-1 p-4 bg-white dark:bg-black bg-opacity-30`}>
          <Text style={tw`font-medium text-lg`}>Weather configuration</Text>
          <Text style={tw`text-sm text-gray-700 dark:text-gray-400 pt-2`}>
            OpenWeatherMap params which allow to show local weather data
          </Text>
          <Text style={tw`pt-8`}>Api Key</Text>

          <Input
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            value={store.ui.weatherApiKey}
            onChangeText={store.ui.setWeatherApiKey}
            placeholder="Api key..."
          />

          <Text style={tw`pt-4`}>Latitude</Text>

          <Input
            // @ts-ignore
            enableFocusRing={false}
            value={store.ui.weatherLat}
            onChangeText={store.ui.setWeatherLat}
            placeholder="Latitude..."
            style={tw`w-full`}
          />

          <Text style={tw`pt-4`}>Longitude</Text>

          <Input
            // @ts-ignore
            enableFocusRing={false}
            value={store.ui.weatherLon}
            onChangeText={store.ui.setWeatherLon}
            placeholder="Longitude..."
            style={tw`w-full`}
          />

          {__DEV__ && (
            <Button
              title="Munich"
              onPress={() => {
                store.ui.setWeatherLat('48.1351')
                store.ui.setWeatherLon('11.5820')
              }}
            />
          )}
        </View>
      )}
    </View>
  )
})
