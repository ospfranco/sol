import { Assets } from 'assets'
import clsx from 'clsx'
import { Dropdown } from 'components/Dropdown'
import { Input } from 'components/Input'
import { MySwitch } from 'components/MySwitch'
import { solNative } from 'lib/SolNative'
import { observer } from 'mobx-react-lite'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useStore } from 'store'

export const isValidCustomSearchEngineUrl = (url: string) => {
  if (url.trim() === '') return false
  const searchPatternRegex =
    /^https?:\/\/(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/[^\s?#]*)?\?[\w-]+=%s$/
  return searchPatternRegex.test(url)
}

export const General = observer(() => {
  const store = useStore()
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      automaticallyAdjustContentInsets
      className="flex-1 -mt-10"
      contentContainerClassName="p-5 gap-2">
      <View className="flex-row items-center p-3 subBg rounded-lg border border-lightBorder dark:border-darkBorder">
        <View className="flex-1">
          <Text className="text-sm text">Open at Login</Text>
          <Text className="text-xxs text-neutral-500 dark:text-neutral-400">
            Launch Sol when your computer starts
          </Text>
        </View>
        <MySwitch
          value={store.ui.launchAtLogin}
          onValueChange={store.ui.setLaunchAtLogin}
        />
      </View>
      <View className="z-20 p-3 subBg gap-3 rounded-lg border border-lightBorder dark:border-darkBorder">
        <View className="flex-row items-center z-30">
          <Text className="flex-1 text-sm">Global Shortcut</Text>
          <Dropdown
            className="w-64"
            value={store.ui.globalShortcut}
            onValueChange={v => {
              store.ui.setGlobalShortcut(v as any)
            }}
            options={[
              { label: '⌘ + ␣', value: 'command' as const },
              { label: '⌥ + ␣', value: 'option' as const },
              { label: '⌃ + ␣', value: 'control' as const },
            ]}
          />
        </View>
        <View className="border-t border-lightBorder dark:border-darkBorder" />
        <View className="flex-row items-center z-20">
          <Text className="flex-1">Search Engine</Text>
          <Dropdown
            className="w-64"
            value={store.ui.searchEngine}
            onValueChange={v => {
              store.ui.setSearchEngine(v as any)
            }}
            options={[
              { label: 'Google', value: 'google' as const },
              { label: 'DuckDuckGo', value: 'duckduckgo' as const },
              { label: 'Bing', value: 'bing' as const },
              { label: 'Custom', value: 'custom' as const },
            ]}
          />
        </View>
        {store.ui.searchEngine === 'custom' && (
          <View className="items-end z-10">
            <View className="w-80 flex-row items-center gap-1">
              {store.ui.searchEngine === 'custom' &&
                (isValidCustomSearchEngineUrl(store.ui.customSearchUrl) ? (
                  <View className="w-2 h-2 rounded-full bg-green-500" />
                ) : (
                  <View className="w-2 h-2 rounded-full bg-red-500" />
                ))}
              <Input
                bordered
                className="w-full text-xs rounded border border-lightBorder dark:border-darkBorder px-1"
                inputClassName="w-full"
                readOnly={store.ui.searchEngine !== 'custom'}
                value={store.ui.customSearchUrl}
                onChangeText={e => store.ui.setCustomSearchUrl(e)}
                placeholder="https://google.com/search?q=%s"
              />
            </View>
            <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 ml-1">
              Use %s in place of the search term
            </Text>
          </View>
        )}
      </View>

      <View className="z-10 p-3 gap-1 subBg rounded-lg border border-lightBorder dark:border-darkBorder">
        <Text className="">File Search Paths</Text>
        <Text className="text-xxs text-neutral-500 dark:text-neutral-400">
          Add folders for the Search Files functionality.
        </Text>
        <View className="mt-2">
          {store.ui.searchFolders.map((folder, idx) => {
            return (
              <View
                key={folder}
                className={clsx('flex-row items-center p-2', {
                  'rounded-t-lg': idx === 0,
                  'rounded-b-lg': idx === store.ui.searchFolders.length - 1,
                  'bg-neutral-100 dark:bg-neutral-900': idx % 2 === 0,
                  'bg-neutral-200 dark:bg-neutral-800': idx % 2 !== 0,
                })}>
                <Text className="flex-1 text-sm">{folder}</Text>
                <TouchableOpacity
                  onPress={() => {
                    store.ui.removeSearchFolder(folder)
                  }}>
                  <Image
                    source={Assets.close}
                    className="h-4 w-4"
                    style={{ tintColor: 'red' }}
                  />
                  {/* <Text className="text-red-500">Remove</Text> */}
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
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
              } catch (e) { }
            }}>
            <Text className="text-blue-500">Add folder</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-3 subBg gap-3 rounded-lg border border-lightBorder dark:border-darkBorder">
        <View className="flex-row items-center z-20">
          <Text className="flex-1">Show Window on Screen with</Text>
          <Dropdown
            className="w-64"
            value={store.ui.showWindowOn}
            onValueChange={v => {
              store.ui.setShowWindowOn(v as any)
            }}
            options={[
              {
                label: 'Frontmost Window',
                value: 'screenWithFrontmost' as const,
              },
              { label: 'Cursor Screen', value: 'screenWithCursor' as const },
            ]}
          />
        </View>
        <View className="border-t border-lightBorder dark:border-darkBorder z-0" />
        <View className="flex-row items-center">
          <Text className="flex-1">Show In-App Calendar</Text>

          <MySwitch
            value={store.ui.calendarEnabled}
            onValueChange={store.ui.setCalendarEnabled}
          />
        </View>
        <View className="border-t border-lightBorder dark:border-darkBorder" />
        <View className="flex-row items-center">
          <Text className="flex-1">Show Browser Bookmarks</Text>
          <MySwitch
            value={store.ui.showInAppBrowserBookMarks}
            onValueChange={store.ui.setShowInAppBrowserBookmarks}
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
          <Text className="flex-1">Forward Media Keys to Music Player</Text>
          <MySwitch
            value={store.ui.mediaKeyForwardingEnabled}
            onValueChange={() => {
              store.ui.setMediaKeyForwardingEnabled(
                !store.ui.mediaKeyForwardingEnabled,
              )
            }}
          />
        </View>
        <View className="border-t border-lightBorder dark:border-darkBorder" />
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text>Send Anonymous Error Reports</Text>
            <Text className="text-xxs text-neutral-500 dark:text-neutral-400">
              Help improve Sol by sending crash reports
            </Text>
          </View>
          <MySwitch
            value={store.ui.telemetryEnabled}
            onValueChange={store.ui.setTelemetryEnabled}
          />
        </View>
      </View>
    </ScrollView>
  )
})
