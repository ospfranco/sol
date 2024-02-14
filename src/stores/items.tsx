import {Assets} from 'assets'
import {IRootStore} from 'store'
import {ItemType, Widget} from './ui.store'
import {solNative} from 'lib/SolNative'
import {Clipboard, Linking, Text, View} from 'react-native'
import {FileIcon} from 'components/FileIcon'
import {nanoid} from 'nanoid'
import {v4 as uuidv4} from 'uuid'
import {systemPreferenceItems} from './systemPreferences'
import Chance from 'chance'

const chance = new Chance()

export function createBaseItems(store: IRootStore) {
  let items: Item[] = [
    {
      iconImage: Assets.DarkModeIcon,
      name: 'Toogle OS theme',
      alias: 'dark',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.toggleDarkMode()
      },
    },
    {
      iconImage: Assets.SleepIcon,
      name: 'Sleep',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.executeAppleScript('tell application "Finder" to sleep')
      },
    },
    {
      icon: '🖥️',
      name: 'Restart Mac',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.executeAppleScript('tell application "Finder" to restart')
      },
    },
    {
      icon: '🌑',
      name: 'Power off Mac',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.executeAppleScript('tell application "Finder" to shut down')
      },
    },
    {
      iconImage: Assets.Airdrop,
      name: 'AirDrop',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.executeAppleScript(`tell application "Finder"
          if exists window "AirDrop" then
                  tell application "System Events" to ¬
                          tell application process "Finder" to ¬
                                  perform action "AXRaise" of ¬
                                          (windows whose title is "AirDrop")
          else if (count Finder windows) > 0 then
                  make new Finder window
                  tell application "System Events" to ¬
                          click menu item "AirDrop" of menu 1 of menu bar item ¬
                                  "Go" of menu bar 1 of application process "Finder"
          else
                  tell application "System Events" to ¬
                          click menu item "AirDrop" of menu 1 of menu bar item ¬
                                  "Go" of menu bar 1 of application process "Finder"
          end if
          activate
        end tell`)
      },
    },
    {
      iconImage: Assets.LockIcon,
      name: 'Lock',
      shortcut: '⌘ ⌥ Q',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.executeAppleScript(
          `tell application "System Events" to keystroke "q" using {control down, command down}`,
        )
      },
    },
    {
      iconImage: Assets.SettingsIcon,
      name: 'Sol Settings',
      alias: 'preferences',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.focusWidget(Widget.SETTINGS)
      },
      preventClose: true,
    },
    {
      icon: '✳️',
      name: 'Create shortcut or script',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.focusWidget(Widget.CREATE_ITEM)
      },
      preventClose: true,
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-start bg-black">
            <View className="w-3  h-3 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to full-screen',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostFullscreen()
      },
      shortcut: '^ ⌥ ↩',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-end bg-black">
            <View className="w-1 h-3 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to right-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostRightHalf()
      },
      shortcut: '^ ⌥ →',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-start bg-black">
            <View className="w-1 h-3 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to left-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostLeftHalf()
      },
      shortcut: '^ ⌥ ←',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-start bg-black">
            <View className="w-1 h-3 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to top-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostTopHalf()
      },
      shortcut: '^ ⌥ ↑',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-start bg-black">
            <View className="w-1 h-3 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to bottom-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostBottomHalf()
      },
      shortcut: '^ ⌥ ↓',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-start bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to top-left',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeTopLeft()
      },
      shortcut: '^ ⌥ U',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-end bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to top-right',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeTopRight()
      },
      shortcut: '^ ⌥ I',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-start justify-end bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to bottom-left',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeBottomLeft()
      },
      shortcut: '^ ⌥ J',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-2 rounded items-end justify-end bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to bottom-right',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeBottomRight()
      },
      shortcut: '^ ⌥ K',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 rounded items-center justify-center bg-black">
            <Text className="text-white">→</Text>
          </View>
        )
      },
      name: 'Move window to next screen',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.moveFrontmostNextScreen()
      },
      shortcut: '^ ⌥ ⌘ →',
    },
    {
      IconComponent: () => {
        return (
          <View className="w-6 h-6 rounded items-center justify-center bg-black">
            <Text className="text-white">←</Text>
          </View>
        )
      },
      name: 'Move window to previous screen',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.moveFrontmostPrevScreen()
      },
      shortcut: '^ ⌥ ⌘ ←',
    },
    {
      icon: '🖊',
      name: 'Scratchpad',
      preventClose: true,
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.focusWidget(Widget.SCRATCHPAD)
      },
      shortcut: '⌘ + ⇧ + Space',
    },
    {
      icon: '😎',
      name: 'Emoji Picker',
      preventClose: true,
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.showEmojiPicker()
      },
      shortcut: '⌘ + ^ + Space',
    },
    {
      icon: '🆙',
      name: 'Check for updates',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.checkForUpdates()
      },
    },
    {
      icon: '📋',
      name: 'Clipboard Manager',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.showClipboardManager()
      },
      preventClose: true,
    },
    {
      icon: '🔫',
      name: 'Kill process',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.showProcessManager()
      },
      preventClose: true,
    },
    {
      IconComponent: (...props: any[]) => (
        <FileIcon {...props} url="~/Downloads" className="w-6 h-6" />
      ),
      name: 'Downloads',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('~/Downloads')
      },
    },
    {
      IconComponent: (...props: any[]) => {
return <FileIcon {...props} url='~/Desktop' className='w-6 h-6' />
      },
      type: ItemType.CONFIGURATION,
      name: 'Desktop',
      callback: () => {
        Linking.openURL('~/Desktop')
      }
    },
    {
      IconComponent: (...props: any[]) => (
        <FileIcon {...props} url="/Applications" className="w-6 h-6" />
      ),
      name: 'Applications',
      alias: 'application',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('/Applications')
      },
    },
    {
      IconComponent: (...props: any[]) => (
        <FileIcon {...props} url="~/Pictures" className="w-6 h-6" />
      ),
      name: 'Pictures',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('~/Pictures')
      },
    },
    {
      IconComponent: (...props: any[]) => (
        <FileIcon {...props} url="~/Developer" className="w-6 h-6" />
      ),
      name: 'Developer',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('~/Developer')
      },
    },
    {
      IconComponent: (...props: any[]) => (
        <FileIcon {...props} url="~/Documents" className="w-6 h-6" />
      ),
      name: 'Documents',
      type: ItemType.CONFIGURATION,
      callback: () => {
        Linking.openURL('~/Documents')
      },
    },
    {
      iconImage: Assets.googleLogo,
      name: 'Start Google Meet',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        await Linking.openURL(`https://meet.google.com/new`)

        solNative.executeAppleScript(`if application "Safari" is running then
          delay 3
          tell application "Safari"
            set myurl to URL of front document as string
          end tell

          set baseUrl to "https://meet.google.com/new"

          if (myurl contains baseUrl) then
            delay 3
            tell application "Safari"
              set myurl to URL of front document as string
            end tell
          else
            set the clipboard to myurl as string
            display notification "Google Meet link copied to clipboard" with title "Link Copied" sound name "Frog"
            return
          end if

          if (myurl contains baseUrl) then
            delay 3
            tell application "Safari"
              set myurl to URL of front document as string
            end tell
          else
            set the clipboard to myurl as string
            display notification "Google Meet link copied to clipboard" with title "Link Copied" sound name "Frog"
            return
          end if

          if (myurl contains baseUrl) then
            delay 3
            tell application "Safari"
              set myurl to URL of front document as string
            end tell
          else
            set the clipboard to myurl as string
            display notification "Google Meet link copied to clipboard" with title "Link Copied" sound name "Frog"
            return
          end if
          
          if (myurl contains baseUrl) then
            display notification "Google Meet could not be copied" with title "Couldn't copy Google Meet link" sound name "Frog"
          else
            set the clipboard to myurl as string
            display notification "Google Meet link copied to clipboard" with title "Link Copied" sound name "Frog"
          end if
        end if
        `)
      },
    },
    {
      IconComponent: () => (
        <FileIcon url="/Applications/Xcode.app" className="w-6 h-6" />
      ),
      name: 'Remove derived data folder',
      alias: 'Clear xcode',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        await solNative.executeBashScript(
          'rm -rf ~/Library/Developer/Xcode/DerivedData',
        )

        solNative.showToast('✅ Cleared')
      },
    },
    {
      icon: '🍔',
      name: 'Generate Nano ID',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        const id = nanoid()
        solNative.pasteToFrontmostApp(id)
        solNative.showToast('✅ Generated and pasted')
      },
    },
    {
      icon: '🍔',
      name: 'Generate UUID',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        const id = uuidv4()
        solNative.pasteToFrontmostApp(id)
        solNative.showToast('✅ Generated and pasted')
      },
    },
    {
      icon: '👴',
      name: 'Generate Lorem Ipsum',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        const paragraph = chance.paragraph()
        solNative.pasteToFrontmostApp(paragraph)
        solNative.showToast('✅ Generated')
      },
    },
    {
      icon: '💀',
      name: 'Quit/Exit Sol',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        solNative.quit()
      },
    },
    {
      icon: '📟',
      name: 'Paste as JSON',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        let latestString = await Clipboard.getString()
        if (latestString)
          try {
            latestString = JSON.parse(latestString)
            solNative.pasteToFrontmostApp(JSON.stringify(latestString, null, 2))
            solNative.showToast('Pasted! ✅')
          } catch (e) {
            solNative.pasteToFrontmostApp(latestString)
            solNative.showToast('Not a valid JSON ❌')
          }
      },
    },
    {
      icon: '☠️',
      name: 'Kill all apps',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        solNative.executeAppleScript(`-- get list of open apps
        tell application "System Events"
          set allApps to displayed name of (every process whose background only is false) as list
        end tell
        
        -- leave some apps open 
        set exclusions to {"AppleScript Editor", "Automator", "Finder", "LaunchBar"}
        
        -- quit each app
        repeat with thisApp in allApps
          set thisApp to thisApp as text
          if thisApp is not in exclusions then
            tell application thisApp to quit
          end if
        end repeat
        `)
      },
    },
    ...systemPreferenceItems,
    {
      icon: '🔑',
      name: 'Copy Wi-Fi Password to Clipboard',
      type: ItemType.CONFIGURATION,
      alias: 'wifi',
      callback: () => {
        const password = solNative.getWifiPassword()
        if (!password) {
          solNative.showToast('🟥 Could not retrieve password')
        } else {
          Clipboard.setString(password)
          solNative.showToast('✅ Password copied to clipboard')
        }
      },
    },
    {
      icon: '📶',
      name: 'Reveal Wi-Fi Password',
      type: ItemType.CONFIGURATION,
      alias: 'wifi',
      callback: () => {
        const password = solNative.getWifiPassword()
        if (!password) {
          solNative.showToast('🟥 Could not retrieve password')
        } else {
          solNative.showToast(`${password}`, 30)
        }
      },
    },
  ]

  if (__DEV__) {
    items.push({
      icon: '🐣',
      name: '[DEV] Restart onboarding',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.onboardingStep = 'v1_start'
        store.ui.focusWidget(Widget.ONBOARDING)
      },
      preventClose: true,
    })

    items.push({
      icon: '🍞',
      name: 'Test toast',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.showToast(
          'This is a Toast test with a long test to make sure everything fits! 🍞',
        )
      },
    })
  }

  return items
}
