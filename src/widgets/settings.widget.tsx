import {Assets} from 'assets'
import clsx from 'clsx'
import {BackButton} from 'components/BackButton'
import {Dropdown} from 'components/Dropdown'
import {FileIcon} from 'components/FileIcon'
import {MyRadioButton} from 'components/MyRadioButton'
import {MySwitch} from 'components/MySwitch'
import {SelectableButton} from 'components/SelectableButton'
import {useFullSize} from 'hooks/useFullSize'
import {languages} from 'lib/languages'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import {FC, useState} from 'react'
import React, {
  FlatList,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {useStore} from 'store'
import {ItemType, Widget} from 'stores/ui.store'
import packageInfo from '../../package.json'

type ITEM = 'ABOUT' | 'GENERAL' | 'TRANSLATE' | 'SHORTCUTS'

export const SettingsWidget: FC = observer(() => {
  const store = useStore()
  useFullSize()
  const [selected, setSelected] = useState<ITEM>('SHORTCUTS')

  return (
    <View className="h-full flex-row">
      <View className="p-3 gap-1 border-r border-lightBorder dark:border-darkBorder">
        <BackButton
          onPress={() => store.ui.focusWidget(Widget.SEARCH)}
          className="mb-2"
        />
        <SelectableButton
          className="w-26 items-center"
          selected={selected === 'GENERAL'}
          onPress={() => setSelected('GENERAL')}
          title="General"
        />
        <SelectableButton
          className="w-26 items-center "
          selected={selected === 'TRANSLATE'}
          onPress={() => setSelected('TRANSLATE')}
          title="Translation"
        />
        <SelectableButton
          className="w-26 items-center "
          selected={selected === 'SHORTCUTS'}
          onPress={() => setSelected('SHORTCUTS')}
          title="Shortcuts"
        />
        <SelectableButton
          className="w-26 items-center "
          selected={selected === 'ABOUT'}
          onPress={() => setSelected('ABOUT')}
          title="About"
        />
      </View>

      <View className="flex-1 h-full">
        {selected === 'ABOUT' && (
          <View className="flex-1 justify-center items-center gap-10 flex-row">
            <Image
              source={Assets.Logo}
              style={{
                height: 180,
                width: 180,
                tintColor: store.ui.isDarkMode ? 'white' : 'black',
              }}
            />
            <View className="gap-2">
              <Text className="text-3xl">Sol</Text>
              <Text className="font-semibold">{packageInfo.version}</Text>
              <View className="flex-row items-center gap-2">
                <Text className="">built by</Text>
                <Image source={Assets.OSP} className="h-6 w-6 rounded-full" />
                <Text className="">ospfranco</Text>
              </View>
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded justify-center items-center"
                onPress={() => {
                  Linking.openURL('https://sol.ospfranco.com/')
                }}>
                <Text className="text-white">Website</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selected === 'SHORTCUTS' && (
          <View className="flex-1 h-full gap-2 subBg">
            <Text className="text-xs px-4 pt-4">
              You can set your own global keyboard shortcuts. Follow the syntax
              "[cmd + shift + option] + a".
            </Text>
            <View className="px-4 pt-4">
              <View className="flex-row items-center py-1.5 px-3 rounded-sm bg-gray-100 dark:bg-neutral-800">
                <Text className="font-bold flex-1">Item</Text>
                <Text className="font-bold">Shortcut</Text>
              </View>
            </View>
            <FlatList
              contentContainerClassName="pl-4 pb-4"
              data={store.ui.items}
              renderItem={({item, index}) => {
                return (
                  <View
                    className={clsx(
                      'flex-row items-center py-1.5 px-3 rounded-sm gap-2',
                      {
                        'bg-gray-200 dark:bg-neutral-800': index % 2 === 1,
                      },
                    )}>
                    {!!item.url && (
                      <FileIcon url={item.url} className={'w-6 h-6'} />
                    )}
                    {item.type !== ItemType.CUSTOM && !!item.icon && (
                      <Text>{item.icon}</Text>
                    )}
                    {item.type === ItemType.CUSTOM && !!item.icon && (
                      <View className="w-6 h-6 rounded items-center justify-center bg-white dark:bg-black">
                        <Image
                          // @ts-expect-error
                          source={Icons[item.icon]}
                          style={{
                            tintColor: item.color,
                            height: 16,
                            width: 16,
                          }}
                        />
                      </View>
                    )}
                    {!!item.iconImage && (
                      <Image
                        source={item.iconImage}
                        className="w-6 h-6"
                        resizeMode="contain"
                      />
                    )}
                    {/* Somehow this component breaks windows build */}
                    {!!item.IconComponent && <item.IconComponent />}
                    <Text className="flex-1">{item.name}</Text>
                    <TextInput
                      className="w-40 text-xs rounded border border-lightBorder dark:border-darkBorder px-1"
                      placeholder="Not set"
                      value={store.ui.shortcuts[item.id] ?? ''}
                    />
                  </View>
                )
              }}
            />
          </View>
        )}

        {selected === 'GENERAL' && (
          <ScrollView
            className="flex-1 h-full"
            contentContainerClassName="justify-center p-5 gap-2">
            <View className="flex-row items-center p-3 subBg rounded-lg border border-lightBorder dark:border-darkBorder">
              <Text className="flex-1 text-sm text">Launch on start</Text>
              <MySwitch
                value={store.ui.launchAtLogin}
                onValueChange={store.ui.setLaunchAtLogin}
              />
            </View>
            <View className="p-3 subBg rounded gap-3 rounded-lg border border-lightBorder dark:border-darkBorder">
              <View className="gap-3">
                <Text className="flex-1 text-sm">Global Shortcut</Text>
                <View className="flex-1">
                  {[
                    {label: '⌘ Space', value: 'command' as const},
                    {label: '⌥ Space', value: 'option' as const},
                    {label: '⌃ Space', value: 'control' as const},
                  ].map(({label, value}, idx) => {
                    return (
                      <MyRadioButton
                        index={idx}
                        label={label}
                        value={value}
                        onValueChange={() => {
                          store.ui.setGlobalShortcut(value)
                        }}
                        selected={store.ui.globalShortcut === value}
                      />
                    )
                  })}
                </View>
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="gap-3">
                <Text className="flex-1">Scratchpad shortcut</Text>
                <View className="flex-1">
                  {[
                    {label: '⌘ ⇧ Space', value: 'command' as const},
                    {label: '⇧ ⌥ Space', value: 'option' as const},
                    {label: 'Disabled', value: 'none' as const},
                  ].map(({label, value}, idx) => {
                    return (
                      <MyRadioButton
                        index={idx}
                        label={label}
                        value={value}
                        onValueChange={() => {
                          store.ui.setScratchpadShortcut(value)
                        }}
                        selected={store.ui.scratchpadShortcut === value}
                      />
                    )
                  })}
                </View>
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="gap-3">
                <Text className="flex-1">Clipboard manager shortcut</Text>
                <View className="flex-1">
                  {[
                    {label: '⌘ ⇧ V', value: 'shift' as const},
                    {label: '⌘ ⌥ V', value: 'option' as const},
                    {label: 'Disabled', value: 'none' as const},
                  ].map(({label, value}, idx) => {
                    return (
                      <MyRadioButton
                        index={idx}
                        label={label}
                        value={value}
                        onValueChange={() => {
                          store.ui.setClipboardManagerShortcut(value)
                        }}
                        selected={store.ui.clipboardManagerShortcut === value}
                      />
                    )
                  })}
                </View>
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="gap-3">
                <Text className="flex-1">Search Engine</Text>
                <View className="flex-1">
                  {[
                    {label: 'Google', value: 'google' as const},
                    {label: 'DuckDuckGo', value: 'duckduckgo' as const},
                    {label: 'Bing', value: 'bing' as const},
                    {label: 'Perplexity', value: 'perplexity' as const},
                  ].map(({label, value}, idx) => {
                    return (
                      <MyRadioButton
                        index={idx}
                        label={label}
                        value={value}
                        onValueChange={() => {
                          store.ui.setSearchEngine(value)
                        }}
                        selected={store.ui.searchEngine === value}
                      />
                    )
                  })}
                </View>
              </View>
            </View>

            <View className="p-3 subBg rounded gap-2 rounded-lg border border-lightBorder dark:border-darkBorder">
              <Text className="mb-1">File Search Paths</Text>
              {store.ui.searchFolders.map(folder => {
                return (
                  <View className="flex-row items-center border-b border-lightBorder dark:border-darkBorder pb-2">
                    <Text className="flex-1 text-neutral-500 dark:text-neutral-400">
                      {folder}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        store.ui.removeSearchFolder(folder)
                      }}>
                      <Text className="text-red-500">Remove</Text>
                    </TouchableOpacity>
                  </View>
                )
              })}
              <View className="justify-end flex-row mt-2">
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      solNative.hideWindow()
                      let path = await solNative.openFilePicker()
                      if (path) {
                        path = path.replace('file://', '')
                        path = decodeURI(path)
                        store.ui.addSearchFolder(path)
                      }
                      solNative.showWindow()
                    } catch (e) {}
                  }}>
                  <Text className="text-blue-500">Add folder</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="p-3 subBg rounded gap-3 rounded-lg border border-lightBorder dark:border-darkBorder">
              <View className="gap-3">
                <Text className="">Show window on</Text>
                <View className="flex-1">
                  {[
                    {
                      label: 'Frontmost window screen',
                      value: 'screenWithFrontmost' as const,
                    },
                    {
                      label: 'Screen with cursor',
                      value: 'screenWithCursor' as const,
                    },
                  ].map(({label, value}, index) => {
                    return (
                      <MyRadioButton
                        index={index}
                        label={label}
                        value={value}
                        onValueChange={() => {
                          store.ui.setShowWindowOn(value)
                        }}
                        selected={store.ui.showWindowOn === value}
                      />
                    )
                  })}
                </View>
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">Window Management Shortcuts</Text>

                <MySwitch
                  value={store.ui.windowManagementEnabled}
                  onValueChange={store.ui.setWindowManagementEnabled}
                />
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">Show calendar</Text>

                <MySwitch
                  value={store.ui.calendarEnabled}
                  onValueChange={store.ui.setCalendarEnabled}
                />
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">Show upcoming event in Menu Bar</Text>
                <MySwitch
                  value={store.ui.showUpcomingEvent}
                  onValueChange={store.ui.setShowUpcomingEvent}
                />
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">Save clipboard history</Text>
                <MySwitch
                  value={store.clipboard.saveHistory}
                  onValueChange={store.clipboard.setSaveHistory}
                />
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">Show background overlay</Text>
                <MySwitch
                  value={store.ui.useBackgroundOverlay}
                  onValueChange={store.ui.setUseBackgroundOverlay}
                />
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">Blacken menubar</Text>
                <MySwitch
                  value={store.ui.shouldHideMenubar}
                  onValueChange={store.ui.setShouldHideMenuBar}
                />
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">
                  Forward media keys to media player
                </Text>
                <MySwitch
                  value={store.ui.mediaKeyForwardingEnabled}
                  onValueChange={store.ui.setMediaKeyForwardingEnabled}
                />
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">Reduce transparency</Text>
                <MySwitch
                  value={store.ui.reduceTransparency}
                  onValueChange={store.ui.setReduceTransparency}
                />
              </View>
              <View className="border-t border-lightBorder dark:border-darkBorder" />
              <View className="flex-row items-center">
                <Text className="flex-1">Disable emoji picker</Text>
                <MySwitch
                  value={store.ui.emojiPickerDisabled}
                  onValueChange={store.ui.toggleEmojiPickerDisabled}
                />
              </View>
            </View>
          </ScrollView>
        )}

        {selected === 'TRANSLATE' && (
          <View className="flex-1 p-6">
            <View className="flex-1 pt-8">
              <View className="flex-row items-center py-2 z-20">
                <Text className="flex-1 text-right mr-2">First language</Text>
                <View className="flex-1">
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
                <View className="flex-1">
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
                <View className="flex-1">
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
