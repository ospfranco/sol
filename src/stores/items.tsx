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
      id: 'toggle_appearance',
      iconImage: Assets.DarkModeIcon,
      name: 'Toggle system appearance',
      alias: 'dark',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.toggleDarkMode()
        solNative.restart()
      },
    },
    {
      id: 'sleep',
      iconImage: Assets.SleepIcon,
      name: 'Sleep',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        try {
          await solNative.executeAppleScript(
            'tell application "Finder" to sleep',
          )
        } catch (e) {
          solNative.showToast(`Could not sleep: ${e}`, 'error')
        }
      },
    },
    {
      id: 'restart',
      icon: '🖥️',
      name: 'Restart System',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        try {
          await solNative.executeAppleScript(
            'tell application "Finder" to restart',
          )
          solNative.showToast('Restarting', 'success')
        } catch (e) {
          solNative.showToast(`Could not restart: ${e}`, 'error')
        }
      },
    },
    {
      id: 'power_off',
      icon: '🌑',
      name: 'Power Off System',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        try {
          await solNative.executeAppleScript(
            'tell application "Finder" to shut down',
          )
          solNative.showToast('Shutting down', 'success')
        } catch (e) {
          solNative.showToast(`Could not power off: ${e}`, 'error')
        }
      },
    },
    {
      id: 'airdrop',
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
      id: 'lock',
      iconImage: Assets.LockIcon,
      name: 'Lock',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        try {
          await solNative.executeAppleScript(
            `tell application "System Events" to keystroke "q" using {control down, command down}`,
          )
        } catch (e) {
          solNative.showToast(`Could not lock: ${e}`, 'error')
        }
      },
    },
    {
      id: 'settings',
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
      id: 'create_shorcut',
      icon: '✳️',
      name: 'Create shortcut or script',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.focusWidget(Widget.CREATE_ITEM)
      },
      preventClose: true,
    },
    {
      id: 'resize_fullscreen',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-center bg-black">
            <View className="w-5 h-5 rounded bg-white" />
          </View>
        )
      },
      name: 'Resize window to full-screen',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostFullscreen()
      },
    },
    {
      id: 'resize_right_half',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-end bg-black">
            <View className="w-3 h-5 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to right-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostRightHalf()
      },
    },
    {
      id: 'resize_left_half',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-start bg-black">
            <View className="w-[50%] h-5 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to left-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostLeftHalf()
      },
    },
    {
      id: 'resize_top_half',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-start bg-black">
            <View className="w-5 h-[50%] rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to top-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostTopHalf()
      },
    },
    {
      id: 'resize_bottom_half',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded justify-end bg-black">
            <View className="w-5 h-[50%] rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to bottom-half',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeFrontmostBottomHalf()
      },
    },
    {
      id: 'resize_top_left',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-start bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to top-left',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeTopLeft()
      },
    },
    {
      id: 'resize_top_right',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-end bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to top-right',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeTopRight()
      },
    },
    {
      id: 'resize_bottom_left',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-start justify-end bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to bottom-left',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeBottomLeft()
      },
    },
    {
      id: 'resize_bottom_right',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-end justify-end bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Resize window to bottom-right',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.resizeBottomRight()
      },
    },
    {
      id: 'move_next_screen',
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
    },
    {
      id: 'move_prev_screen',
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
    },
    {
      id: 'move_center',
      IconComponent: () => {
        return (
          <View className="w-6 h-6 p-0.5 rounded items-center justify-center bg-black">
            <View className="w-1 h-1 p-1 rounded-sm bg-white" />
          </View>
        )
      },
      name: 'Move window to center',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.moveFrontmostCenter()
      },
    },
    {
      id: 'scratchpad',
      icon: '🖊',
      name: 'Scratchpad',
      preventClose: true,
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.focusWidget(Widget.SCRATCHPAD)
      },
    },
    {
      id: 'emoji_picker',
      icon: '😎',
      name: 'Emoji Picker',
      preventClose: true,
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.showEmojiPicker()
      },
    },
    {
      id: 'check_for_updates',
      icon: '🆙',
      name: 'Check for updates',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.checkForUpdates()
      },
    },
    {
      id: 'clipboard_manager',
      icon: '📋',
      name: 'Clipboard Manager',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.showClipboardManager()
      },
      preventClose: true,
    },
    {
      id: 'process_manager',
      icon: '🔫',
      name: 'Kill process',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.showProcessManager()
      },
      preventClose: true,
    },
    {
      id: 'file_search',
      icon: '📁',
      name: 'File Search',
      type: ItemType.CONFIGURATION,
      callback: () => {
        store.ui.showFileSearch()
      },
      preventClose: true,
    },
    {
      id: 'downloads_folder',
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
      id: 'desktop_folder',
      IconComponent: (...props: any[]) => {
        return <FileIcon {...props} url="~/Desktop" className="w-6 h-6" />
      },
      type: ItemType.CONFIGURATION,
      name: 'Desktop',
      callback: () => {
        Linking.openURL('~/Desktop')
      },
    },
    {
      id: 'applications_folder',
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
      id: 'pictures_folder',
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
      id: 'developer_folder',
      IconComponent: (...props: any[]) => (
        <FileIcon {...props} url="~/Developer" className="w-6 h-6" />
      ),
      name: 'Developer',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        try {
          await Linking.openURL('~/Developer')
        } catch (e) {
          solNative.showToast(
            'Developer folder not found, try creating ~/Developer 😉',
            'error',
          )
        }
      },
    },
    {
      id: 'documents_folder',
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
      id: 'start_google_meet',
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
      id: 'clear_derived_data',
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

        solNative.showToast('Cleared', 'success')
      },
    },
    {
      id: 'generate_nano_id',
      icon: '🍔',
      name: 'Generate Nano ID',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        const id = nanoid()
        solNative.pasteToFrontmostApp(id)
        solNative.showToast('Generated and pasted', 'success')
      },
    },
    {
      id: 'generate_uuid',
      icon: '🍔',
      name: 'Generate UUID',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        const id = uuidv4()
        solNative.pasteToFrontmostApp(id)
        solNative.showToast('Generated and pasted', 'success')
      },
    },
    {
      id: 'generate_lorem_ipsum',
      icon: '👴',
      name: 'Generate Lorem Ipsum',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        const paragraph = chance.paragraph()
        solNative.pasteToFrontmostApp(paragraph)
        solNative.showToast('Generated', 'success')
      },
    },
    {
      id: 'quit_sol',
      icon: '💀',
      name: 'Quit/Exit Sol',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        solNative.quit()
      },
    },
    {
      id: 'paste_as_json',
      icon: '📟',
      name: 'Paste as JSON',
      type: ItemType.CONFIGURATION,
      callback: async () => {
        let latestString = await Clipboard.getString()
        if (latestString)
          try {
            latestString = JSON.parse(latestString)
            solNative.pasteToFrontmostApp(JSON.stringify(latestString, null, 2))
            solNative.showToast('Pasted!', 'success')
          } catch (e) {
            solNative.pasteToFrontmostApp(latestString)
            solNative.showToast('Not a valid JSON', 'error')
          }
      },
    },
    {
      id: 'kill_all_apps',
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
      id: 'copy_wifi_password',
      icon: '🔑',
      name: 'Copy Wi-Fi Password to Clipboard',
      type: ItemType.CONFIGURATION,
      alias: 'wifi',
      callback: () => {
        try {
          const res = solNative.getWifiPassword()
          if (!res) {
            solNative.showToast(`No password found`, 'error')
            return
          }
          Clipboard.setString(res.password)
          solNative.showToast('Password copied to clipboard', 'success')
        } catch (e) {
          solNative.showToast(`Could not retrieve password: ${e}`, 'error')
        }
      },
    },
    {
      id: 'reveal_wifi_password',
      icon: '📶',
      name: 'Reveal Wi-Fi Password',
      type: ItemType.CONFIGURATION,
      alias: 'wifi',
      callback: () => {
        try {
          const res = solNative.getWifiPassword()
          if (!res) {
            solNative.showToast(`Could not retrieve password`, 'success')
            return
          }

          Clipboard.setString(res.password)
          solNative.showWifiQR(res.ssid, res.password)
        } catch (e) {
          solNative.showToast(`Could not retrieve password: ${e}`, 'error')
        }
      },
    },
    {
      id: 'empty_trash',
      icon: '🗑️',
      name: 'Empty Trash',
      type: ItemType.CONFIGURATION,
      alias: 'trash',
      callback: async () => {
        try {
          await solNative.executeAppleScript(
            `tell application "Finder" to empty trash`,
          )
          solNative.showToast('Trash emptied', 'success')
        } catch (e) {
          solNative.showToast(`Could not empty trash: ${e}`, 'error')
        }
      },
    },
    // {
    //   icon: '⌨️',
    //   name: 'Add VSCode bindings to Xcode',
    //   type: ItemType.CONFIGURATION,
    //   callback: async () => {
    //     await solNative.executeBashScript(
    //       `touch ~/Library/Developer/Xcode/UserData/KeyBindings/VSCodeKeyBindings.idekeybindings`,
    //     )

    //     solNative.showToast('✅ Added bindings. Select them from the Xcode preferences')
    //   },
    // }
  ]

  if (__DEV__) {
    items.push({
      id: 'restart_onboarding',
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
      id: 'sucess_toast',
      icon: '🍞',
      name: 'Success toast',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.showToast(
          'This is a Toast test with a long test to make sure everything fits! 🍞',
          'success',
        )
      },
    })
    items.push({
      id: 'error_toast',
      icon: '🍞',
      name: 'error toast',
      type: ItemType.CONFIGURATION,
      callback: () => {
        solNative.showToast(
          'This is a Toast test with a long test to make sure everything fits! 🍞',
          'error',
        )
      },
    })
  }

  return items
}
