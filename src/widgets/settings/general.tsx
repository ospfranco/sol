import {MyRadioButton} from 'components/MyRadioButton'
import {MySwitch} from 'components/MySwitch'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import {ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {useStore} from 'store'

export const General = observer(() => {
  const store = useStore()
  return (
    <ScrollView
      className="flex-1 h-full"
      contentContainerClassName="justify-center pb-5 px-5 gap-2">
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
                  key={idx}
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
                  key={idx}
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
            <View
              key={folder}
              className="flex-row items-center border-b border-lightBorder dark:border-darkBorder pb-2">
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
                  key={index}
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
          <Text className="flex-1">Show In-App Calendar</Text>

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
          <Text className="flex-1">Forward media keys to media player</Text>
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
      </View>
    </ScrollView>
  )
})
