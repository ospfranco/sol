import {Assets} from 'assets'
import {Dropdown} from 'components/Dropdown'
import {Input} from 'components/Input'
import {MySwitch} from 'components/MySwitch'
import {SelectableButton} from 'components/SelectableButton'
import {useBoolean} from 'hooks'
import {useFullSize} from 'hooks/useFullSize'
import {languages} from 'lib/languages'
import {observer} from 'mobx-react-lite'
import React, {FC, useState} from 'react'
import {
  Appearance,
  Button,
  Image,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

type ITEM = 'ABOUT' | 'WEATHER' | 'GENERAL' | 'TRANSLATE'

const SettingsButton = () => {
  const store = useStore()
  const [hovered, hoverOn, hoverOff] = useBoolean()
  return (
    <TouchableOpacity
      // @ts-expect-error
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      onPress={() => {
        store.ui.focusWidget(Widget.SEARCH)
      }}>
      <View
        style={tw.style(`flex-row items-center rounded py-2 bg-opacity-20`, {
          'bg-neutral-500 dark:bg-neutral-300': hovered,
        })}>
        <Image
          source={Assets.ChevronLeft}
          style={tw.style(`h-5 w-5`, {
            tintColor: tw.color('text-gray-400')!,
          })}
        />

        <Text> Preferences</Text>
      </View>
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
    <View style={tw.style(`flex-row flex-1`)}>
      <View
        style={tw`p-3 w-40 border-r border-lightBorder dark:border-darkBorder`}>
        <SettingsButton />

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

      <View style={tw`flex-1 bg-white dark:bg-dark bg-opacity-70`}>
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
          <View style={tw`flex-1 p-6 bg-white dark:bg-black bg-opacity-30`}>
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
          <View
            style={tw`flex-1 p-6 bg-white dark:bg-black dark:bg-opacity-30 justify-center`}>
            <View style={tw`flex-row items-center py-2`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Launch on computer start
              </Text>
              <View style={tw`flex-1.3`}>
                <MySwitch
                  value={store.ui.launchAtLogin}
                  onValueChange={store.ui.setLaunchAtLogin}
                />
              </View>
            </View>

            <View style={tw`flex-row items-center py-2 z-10`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Global shortcut
              </Text>
              <View style={tw`flex-1.3`}>
                <Dropdown
                  value={store.ui.globalShortcut}
                  onValueChange={v => store.ui.setGlobalShortcut(v as any)}
                  options={[
                    {label: '⌘ Space', value: 'command'},
                    {label: '⌥ Space', value: 'option'},
                  ]}
                />
              </View>
            </View>
            <View style={tw`flex-row items-center py-2 z-9`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Scratchpad shortcut
              </Text>
              <View style={tw`flex-1.3`}>
                <Dropdown
                  value={store.ui.scratchpadShortcut}
                  onValueChange={v => store.ui.setScratchpadShortcut(v as any)}
                  options={[
                    {label: '⌘ ⇧ Space', value: 'command'},
                    {label: '⇧ ⌥ Space', value: 'option'},
                  ]}
                />
              </View>
            </View>
            <View style={tw`flex-row items-center py-2 z-8`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Clipboard manager shortcut
              </Text>
              <View style={tw`flex-1.3`}>
                <Dropdown
                  value={store.ui.clipboardManagerShortcut}
                  onValueChange={v =>
                    store.ui.setClipboardManagerShortcut(v as any)
                  }
                  options={[
                    {label: '⌘ ⇧ V', value: 'shift'},
                    {label: '⌘ ⌥ V', value: 'option'},
                  ]}
                />
              </View>
            </View>

            <View style={tw`flex-row items-center py-2 z-7`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Show window on
              </Text>
              <View style={tw`flex-1.3`}>
                <Dropdown
                  value={store.ui.showWindowOn}
                  onValueChange={v => store.ui.setShowWindowOn(v as any)}
                  options={[
                    {
                      label: 'Frontmost window screen',
                      value: 'screenWithFrontmost',
                    },
                    {label: 'Screen with cursor', value: 'screenWithCursor'},
                  ]}
                  style={tw`w-64`}
                />
              </View>
            </View>

            <View style={tw`flex-row items-center py-2`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Search GitHub
              </Text>
              <View style={tw`flex-1.3`}>
                <MySwitch
                  value={store.ui.githubSearchEnabled}
                  onValueChange={store.ui.setGithubSearchEnabled}
                />
              </View>
            </View>

            <View style={tw`flex-row items-center py-2`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                GitHub Token
              </Text>

              <View style={tw`flex-1.3 flex-row`}>
                <Input
                  value={store.ui.githubToken ?? ''}
                  onChangeText={store.ui.setGithubToken}
                  placeholder="GitHub token..."
                  bordered
                  style={tw`w-64`}
                />
              </View>
            </View>

            <View style={tw`flex-row items-center py-2`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Window Management Shortcuts
              </Text>
              <View style={tw`flex-1.3`}>
                <MySwitch
                  value={store.ui.windowManagementEnabled}
                  onValueChange={store.ui.setWindowManagementEnabled}
                />
              </View>
            </View>

            <View style={tw`flex-row items-center py-2`}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Show calendar
              </Text>
              <View style={tw`flex-1.3`}>
                <MySwitch
                  value={store.ui.calendarEnabled}
                  onValueChange={store.ui.setCalendarEnabled}
                />
              </View>
            </View>

            <View
              style={tw.style(`flex-row items-center py-2`, {
                'opacity-50': !store.ui.calendarEnabled,
              })}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Show all-day events
              </Text>
              <View style={tw`flex-1.3`}>
                <MySwitch
                  disabled={!store.ui.calendarEnabled}
                  value={store.ui.showAllDayEvents}
                  onValueChange={store.ui.setShowAllDayEvents}
                />
              </View>
            </View>

            <View style={tw.style(`flex-row items-center py-2`)}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Show currently playing
              </Text>
              <View style={tw`flex-1.3`}>
                <MySwitch
                  value={store.ui.showPlaying}
                  onValueChange={store.ui.setShowPlaying}
                />
              </View>
            </View>

            <View style={tw.style(`flex-row items-center py-2`)}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Save clipboard history
              </Text>
              <View style={tw`flex-1.3`}>
                <MySwitch
                  value={store.clipboard.saveHistory}
                  onValueChange={store.clipboard.setSaveHistory}
                />
              </View>
            </View>

            <View style={tw.style(`flex-row items-center py-2`)}>
              <Text style={tw`flex-1 text-right pr-3 text-sm`}>
                Show hint bar
              </Text>
              <View style={tw`flex-1.3`}>
                <MySwitch
                  value={store.ui.showHintBar}
                  onValueChange={store.ui.setShowHintBar}
                />
              </View>
            </View>
          </View>
        )}
        {selected === 'TRANSLATE' && (
          <View style={tw`flex-1 p-6 bg-white dark:bg-black bg-opacity-30`}>
            <View style={tw`flex-1 pt-8`}>
              <View style={tw`flex-row items-center py-2 z-10`}>
                <Text style={tw`flex-1 text-right mr-2`}>First language</Text>
                <View style={tw`flex-1.3`}>
                  <Dropdown
                    value={store.ui.firstTranslationLanguage}
                    onValueChange={v =>
                      store.ui.setFirstTranslationLanguage(v as any)
                    }
                    options={Object.values(languages).map(v => ({
                      // @ts-expect-error
                      label: `${v.name} ${v.flag ?? ''}`,
                      value: v.code,
                    }))}
                  />
                </View>
              </View>
              <View style={tw`flex-row items-center py-2 z-9`}>
                <Text style={tw`flex-1 text-right mr-2`}>Second language</Text>
                <View style={tw`flex-1.3`}>
                  <Dropdown
                    value={store.ui.secondTranslationLanguage}
                    onValueChange={v =>
                      store.ui.setSecondTranslationLanguage(v as any)
                    }
                    options={Object.values(languages).map((v, index) => ({
                      // @ts-expect-error
                      label: `${v.name} ${v.flag ?? ''}`,
                      value: v.code,
                    }))}
                  />
                </View>
              </View>
              <View style={tw`flex-row items-center py-2 z-8`}>
                <Text style={tw`flex-1 text-right mr-2`}>Third language</Text>
                <View style={tw`flex-1.3`}>
                  <Dropdown
                    value={store.ui.thirdTranslationLanguage ?? ''}
                    onValueChange={v =>
                      store.ui.setThirdTranslationLanguage(v as any)
                    }
                    options={Object.values(languages).map((v, index) => ({
                      // @ts-expect-error
                      label: `${v.name} ${v.flag ?? ''}`,
                      value: v.code,
                    }))}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
})
