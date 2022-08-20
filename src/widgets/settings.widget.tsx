import {Picker} from '@react-native-picker/picker'
import {Assets} from 'assets'
import {Input} from 'components/Input'
import {useFullSize} from 'hooks/useFullSize'
import languages from 'lib/languages.json'
import {observer} from 'mobx-react-lite'
import React, {FC, useState} from 'react'
import {
  Appearance,
  Button,
  Image,
  Switch,
  Text,
  TextInput,
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

type ITEM = 'ABOUT' | 'WEATHER' | 'GENERAL' | 'TRANSLATE'

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
      // @ts-ignore
      focusRingEnabled={false}
      style={tw.style(
        'rounded px-2 py-1 w-full',
        {
          'bg-accent dark:bg-opacity-40 bg-opacity-80': selected,
        },
        style,
      )}>
      <Text
        style={tw.style(``, {
          'text-white': selected,
        })}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export const SettingsWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  useFullSize()
  const colorScheme = Appearance.getColorScheme()
  useDeviceContext(tw)
  const [selected, setSelected] = useState<ITEM>('GENERAL')

  return (
    <View style={tw.style(`flex-row flex-1`, style)}>
      <View
        style={tw`p-4 w-44 border-r border-lightBorder dark:border-darkBorder`}>
        <TouchableOpacity
          onPress={() => {
            store.ui.focusWidget(FocusableWidget.SEARCH)
          }}>
          <View style={tw`flex-row items-center`}>
            <Image
              source={Assets.ChevronLeft}
              style={tw.style(`h-5 w-5`, {
                tintColor: tw.color('text-gray-400')!,
              })}
            />

            <Text style={tw`text-lg`}> Settings</Text>
          </View>
        </TouchableOpacity>
        <View style={tw`w-full pl-4`}>
          <SelectableButton
            title="General"
            selected={selected === 'GENERAL'}
            style={tw`mt-3`}
            onPress={() => setSelected('GENERAL')}
          />
          <SelectableButton
            title="Translation"
            selected={selected === 'TRANSLATE'}
            style={tw`mt-1`}
            onPress={() => setSelected('TRANSLATE')}
          />
          <SelectableButton
            title="Weather"
            selected={selected === 'WEATHER'}
            style={tw`mt-1`}
            onPress={() => setSelected('WEATHER')}
          />
          <SelectableButton
            title="About"
            selected={selected === 'ABOUT'}
            style={tw`mt-1`}
            onPress={() => setSelected('ABOUT')}
          />
        </View>
      </View>
      {selected === 'ABOUT' && (
        <View
          style={tw`flex-1 justify-center items-center bg-white dark:bg-black bg-opacity-30`}>
          <Image
            source={Assets.Logo}
            style={tw.style(`h-20 w-32`, {
              tintColor: colorScheme === 'dark' ? 'white' : 'black',
            })}
          />
          <Text style={tw`font-thin text-3xl`}>SOL</Text>
          <Text style={tw`text-xs pt-2`}>By Oscar Franco</Text>
          <Text style={tw`text-xs`}>MIT Licensed</Text>
        </View>
      )}
      {selected === 'WEATHER' && (
        <View style={tw`flex-1 p-4 bg-white dark:bg-black bg-opacity-30`}>
          <Text style={tw`text-lg`}>Weather configuration</Text>
          <Text style={tw`text-sm text-gray-700 dark:text-gray-400 pt-2`}>
            OpenWeatherMap params which allow to show local weather data
          </Text>

          <View
            style={tw`w-full h-1 border-b border-lightBorder dark:border-darkBorder mt-3 mb-5`}
          />

          <Text style={tw``}>Api Key</Text>

          <Input
            autoFocus
            value={store.ui.weatherApiKey}
            onChangeText={store.ui.setWeatherApiKey}
            placeholder="Api key..."
            bordered
            style={tw`mt-2`}
          />

          <Text style={tw`pt-4`}>Latitude</Text>

          <Input
            value={store.ui.weatherLat}
            onChangeText={store.ui.setWeatherLat}
            placeholder="Latitude..."
            style={tw`w-full mt-2`}
            bordered
          />

          <Text style={tw`pt-4`}>Longitude</Text>

          <Input
            value={store.ui.weatherLon}
            onChangeText={store.ui.setWeatherLon}
            placeholder="Longitude..."
            style={tw`w-full mt-2`}
            bordered
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
      {selected === 'GENERAL' && (
        <View style={tw`flex-1 p-4 bg-white dark:bg-black bg-opacity-30`}>
          <Text style={tw`text-lg`}>General</Text>

          <View
            style={tw`w-full h-1 border-b border-lightBorder dark:border-darkBorder mt-3 mb-5`}
          />

          <View style={tw`flex-row h-8 items-center`}>
            <Text style={tw`flex-1`}>Global shortcut</Text>
            <Picker
              selectedValue={store.ui.globalShortcut}
              style={tw`w-32`}
              onValueChange={v => store.ui.setGlobalShortcut(v)}>
              <Picker.Item label="⌘ Space" value="command" />
              <Picker.Item label="⌥ space" value="option" />
            </Picker>
          </View>
          <View style={tw`flex-row h-8 items-center`}>
            <Text style={tw`flex-1`}>Scratchpad shortcut</Text>
            <Picker
              selectedValue={store.ui.scratchpadShortcut}
              style={tw`w-32`}
              onValueChange={v => store.ui.setScratchpadShortcut(v)}>
              <Picker.Item label="⌘ ⇧ Space" value="command" />
              <Picker.Item label="⇧ ⌥ Space" value="option" />
            </Picker>
          </View>
          <View style={tw`flex-row h-8 items-center`}>
            <Text style={tw`flex-1`}>Clipboard manager shortcut</Text>
            <Picker
              selectedValue={store.ui.clipboardManagerShortcut}
              style={tw`w-32`}
              onValueChange={v => store.ui.setClipboardManagerShortcut(v)}>
              <Picker.Item label="⌘ ⇧ V" value="shift" />
              <Picker.Item label="⌘ ⌥ V" value="option" />
            </Picker>
          </View>

          <View style={tw`flex-row h-8 items-center`}>
            <Text style={tw`flex-1`}>Search GitHub</Text>
            <Switch
              value={store.ui.githubSearchEnabled}
              onValueChange={store.ui.setGithubSearchEnabled}
            />
          </View>

          <View style={tw`mt-2`}>
            <Text>GitHub Token</Text>
            <View
              style={tw`rounded border border-lightBorder dark:border-darkBorder px-2 py-2 w-92 mt-3`}>
              <TextInput
                value={store.ui.githubToken ?? ''}
                onChangeText={store.ui.setGithubToken}
                placeholder="GitHub token..."
                // @ts-ignore
                enableFocusRing={false}
              />
            </View>
          </View>
        </View>
      )}
      {selected === 'TRANSLATE' && (
        <View style={tw`flex-1 p-4 bg-white dark:bg-black bg-opacity-30`}>
          <Text style={tw`text-lg`}>Translation</Text>
          <Text style={tw`text-sm text-gray-700 dark:text-gray-400 pt-2`}>
            Configure the languages to translate
          </Text>

          <View
            style={tw`w-full h-1 border-b border-lightBorder dark:border-darkBorder mt-3 mb-5`}
          />

          <View style={tw`flex-row items-center h-6`}>
            <Text style={tw`flex-1`}>First language</Text>
            <Picker
              onValueChange={store.ui.setFirstTranslationLanguage}
              selectedValue={store.ui.firstTranslationLanguage}
              style={tw`w-32`}>
              {Object.values(languages).map((v, index) => {
                return <Picker.Item label={v.name} value={v.code} key={index} />
              })}
            </Picker>
          </View>
          <View style={tw`flex-row items-center mt-2 h-6`}>
            <Text style={tw`flex-1`}>Second language</Text>
            <Picker
              onValueChange={store.ui.setSecondTranslationLanguage}
              selectedValue={store.ui.secondTranslationLanguage}
              style={tw`w-32`}>
              {Object.values(languages).map((v, index) => {
                return <Picker.Item label={v.name} value={v.code} key={index} />
              })}
            </Picker>
          </View>
        </View>
      )}
    </View>
  )
})
