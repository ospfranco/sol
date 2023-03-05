import {Assets} from 'assets'
import clsx from 'clsx'
import {Dropdown} from 'components/Dropdown'
import {Input} from 'components/Input'
import {MySwitch} from 'components/MySwitch'
import {SelectableButton} from 'components/SelectableButton'
import {StyledScrollView} from 'components/StyledScrollView'
import {useBoolean} from 'hooks'
import {useFullSize} from 'hooks/useFullSize'
import {languages} from 'lib/languages'
import {observer} from 'mobx-react-lite'
import React, {FC, useState} from 'react'
import {
  Button,
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'
import colors from 'tailwindcss/colors'
// @ts-ignore
import packageInfo from '../../package.json'

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
        className={clsx('flex-row items-center py-4', {
          'bg-lightBorder dark:bg-neutral-500 dark:bg-darkBorder': hovered,
        })}>
        <Image
          source={Assets.ChevronLeft}
          className={'h-5 w-5'}
          style={{
            tintColor: colors.gray[400],
          }}
        />
        <Text> Preferences</Text>
      </View>
    </TouchableOpacity>
  )
}

export const SettingsWidget: FC = observer(() => {
  const store = useStore()
  useFullSize()
  const colorScheme = useColorScheme()

  const [selected, setSelected] = useState<ITEM>('GENERAL')

  return (
    <View className="flex-row flex-1">
      <View className="w-40 border-r bg-light border-lightBorder dark:border-darkBorder dark:bg-dark">
        <SettingsButton />

        <SelectableButton
          title="General"
          selected={selected === 'GENERAL'}
          onPress={() => setSelected('GENERAL')}
        />
        <SelectableButton
          title="Translation"
          selected={selected === 'TRANSLATE'}
          onPress={() => setSelected('TRANSLATE')}
        />
        <SelectableButton
          title="Weather"
          selected={selected === 'WEATHER'}
          onPress={() => setSelected('WEATHER')}
        />
        <SelectableButton
          title="About"
          selected={selected === 'ABOUT'}
          onPress={() => setSelected('ABOUT')}
        />
      </View>

      <View className="flex-1 bg-lighter dark:bg-darker">
        {selected === 'ABOUT' && (
          <View className="flex-1 justify-center items-center">
            <Text className="text-4xl">Sol</Text>
            <Text className="mt-2 text-neutral-500 dark:text-neutral-300">
              {packageInfo.version}
            </Text>
            <Text className="mt-4">By Oscar Franco</Text>
          </View>
        )}
        {selected === 'WEATHER' && (
          <View className="flex-1 p-6">
            <Text>Api Key</Text>

            <Input
              autoFocus
              value={store.ui.weatherApiKey}
              onChangeText={store.ui.setWeatherApiKey}
              placeholder="Api key..."
              bordered
              className="mt-2"
            />

            <Text className="pt-4">Latitude</Text>

            <Input
              value={store.ui.weatherLat}
              onChangeText={store.ui.setWeatherLat}
              placeholder="Latitude..."
              className="w-full mt-2"
              bordered
            />

            <Text className="pt-4">Longitude</Text>

            <Input
              value={store.ui.weatherLon}
              onChangeText={store.ui.setWeatherLon}
              placeholder="Longitude..."
              className="w-full mt-2"
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
          <StyledScrollView
            showsVerticalScrollIndicator
            className="flex-1"
            contentContainerStyle="justify-center">
            <View className="flex-row items-center pb-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Launch on start
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.ui.launchAtLogin}
                  onValueChange={store.ui.setLaunchAtLogin}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2 z-30">
              <Text className="flex-1 text-right pr-3 text-sm">
                Global shortcut
              </Text>
              <View className="flex-[1.3]">
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
            <View className="flex-row items-center py-2 z-20">
              <Text className="flex-1 text-right pr-3 text-sm">
                Scratchpad shortcut
              </Text>
              <View className="flex-[1.3]">
                <Dropdown
                  value={store.ui.scratchpadShortcut}
                  onValueChange={v => store.ui.setScratchpadShortcut(v as any)}
                  options={[
                    {label: '⌘ ⇧ Space', value: 'command'},
                    {label: '⇧ ⌥ Space', value: 'option'},
                    {label: 'Disabled', value: 'none'},
                  ]}
                />
              </View>
            </View>
            <View className="flex-row items-center py-2 z-10">
              <Text className="flex-1 text-right pr-3 text-sm">
                Clipboard manager shortcut
              </Text>
              <View className="flex-[1.3]">
                <Dropdown
                  value={store.ui.clipboardManagerShortcut}
                  onValueChange={v =>
                    store.ui.setClipboardManagerShortcut(v as any)
                  }
                  options={[
                    {label: '⌘ ⇧ V', value: 'shift'},
                    {label: '⌘ ⌥ V', value: 'option'},
                    {label: 'Disabled', value: 'none'},
                  ]}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2 z-7">
              <Text className="flex-1 text-right pr-3 text-sm">
                Show window on
              </Text>
              <View className="flex-[1.3]">
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
                  className="w-64"
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Search GitHub
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.ui.githubSearchEnabled}
                  onValueChange={store.ui.setGithubSearchEnabled}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                GitHub Token
              </Text>

              <View className="flex-[1.3] flex-row">
                <Input
                  value={store.ui.githubToken ?? ''}
                  onChangeText={store.ui.setGithubToken}
                  placeholder="GitHub token..."
                  bordered
                  className="w-64"
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Window Management Shortcuts
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.ui.windowManagementEnabled}
                  onValueChange={store.ui.setWindowManagementEnabled}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Show calendar
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.ui.calendarEnabled}
                  onValueChange={store.ui.setCalendarEnabled}
                />
              </View>
            </View>

            <View
              className={clsx(`flex-row items-center py-2`, {
                'opacity-50': !store.ui.calendarEnabled,
              })}>
              <Text className="flex-1 text-right pr-3 text-sm">
                Show all-day events
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  disabled={!store.ui.calendarEnabled}
                  value={store.ui.showAllDayEvents}
                  onValueChange={store.ui.setShowAllDayEvents}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Show currently playing
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.ui.showPlaying}
                  onValueChange={store.ui.setShowPlaying}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Save clipboard history
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.clipboard.saveHistory}
                  onValueChange={store.clipboard.setSaveHistory}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Show hint bar
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.ui.showHintBar}
                  onValueChange={store.ui.setShowHintBar}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Show background overlay
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.ui.useBackgroundOverlay}
                  onValueChange={store.ui.setUseBackgroundOverlay}
                />
              </View>
            </View>

            <View className="flex-row items-center py-2">
              <Text className="flex-1 text-right pr-3 text-sm">
                Blacken menubar
              </Text>
              <View className="flex-[1.3]">
                <MySwitch
                  value={store.ui.shouldHideMenubar}
                  onValueChange={store.ui.setShouldHideMenuBar}
                />
              </View>
            </View>
          </StyledScrollView>
        )}
        {selected === 'TRANSLATE' && (
          <View className="flex-1 p-6">
            <View className="flex-1 pt-8">
              <View className="flex-row items-center py-2 z-20">
                <Text className="flex-1 text-right mr-2">First language</Text>
                <View className="flex-[1.3]">
                  <Dropdown
                    className="w-40"
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
              <View className="flex-row items-center py-2 z-10">
                <Text className="flex-1 text-right mr-2">Second language</Text>
                <View className="flex-[1.3]">
                  <Dropdown
                    className="w-40"
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
              <View className="flex-row items-center py-2">
                <Text className="flex-1 text-right mr-2">Third language</Text>
                <View className="flex-[1.3]">
                  <Dropdown
                    className="w-40"
                    value={store.ui.thirdTranslationLanguage ?? ''}
                    onValueChange={v =>
                      store.ui.setThirdTranslationLanguage(v as any)
                    }
                    options={Object.values(languages).map(v => ({
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
