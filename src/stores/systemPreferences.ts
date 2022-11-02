import {Linking} from 'react-native'
import {SystemPreferencesIcon} from 'components/SystemPreferencesIcon'
import {solNative} from 'lib/SolNative'
import {ItemType} from './ui.store'

const panes = [
  {
    name: 'Language & Region',
    preferenceId: 'com.apple.Localization',
    venturaPath: '/System/Library/PreferencePanes/Localization.prefPane',
  },
  {
    name: 'Date & Time',
    preferenceId: 'com.apple.preference.datetime',
    venturaPath: '/System/Library/PreferencePanes/DateAndTime.prefPane',
  },
  {
    name: 'Desktop & ScreenSaver',
    preferenceId: 'com.apple.preference.desktopscreeneffect',
    venturaPath:
      '/System/Library/PreferencePanes/DesktopScreenEffectsPref.prefPane',
  },
  {
    name: 'Display',
    preferenceId: 'com.apple.preference.displays',
    venturaPath: '/System/Library/PreferencePanes/Displays.prefPane',
  },
  {
    name: 'Dock & Menubar',
    preferenceId: 'com.apple.preference.dock',
    venturaPath: '/System/Library/PreferencePanes/Dock.prefPane',
  },
  {
    name: 'Battery',
    preferenceId: 'com.apple.preference.battery',
    venturaPath: '/System/Library/PreferencePanes/EnergySaver.prefPane', // does not work
  },
  {
    name: 'Exposé',
    preferenceId: 'com.apple.preference.expose',
    venturaPath: '/System/Library/PreferencePanes/Expose.prefPane',
  },
  {
    name: 'General',
    preferenceId: 'com.apple.preference.general',
    venturaPath: '/System/Library/PreferencePanes/General.prefPane',
  },
  {
    name: 'Keyboard',
    preferenceId: 'com.apple.preference.keyboard',
    venturaPath: '/System/Library/PreferencePanes/Keyboard.prefPane',
  },
  {
    name: 'Mouse',
    preferenceId: 'com.apple.preference.mouse',
    venturaPath: '/System/Library/PreferencePanes/Mouse.prefPane',
  },
  {
    name: 'Network',
    preferenceId: 'com.apple.preference.network',
    venturaPath: '/System/Library/PreferencePanes/Network.prefPane',
  },
  {
    name: 'Notifications',
    preferenceId: 'com.apple.preference.notifications',
    venturaPath: '/System/Library/PreferencePanes/Notifications.prefPane',
  },
  {
    name: 'Printers & Scanners',
    preferenceId: 'com.apple.preference.printfax',
    venturaPath: '/System/Library/PreferencePanes/PrintAndFax.prefPane',
  },
  {
    name: 'Screen Time',
    preferenceId: 'com.apple.preference.screentime',
    venturaPath: '/System/Library/PreferencePanes/ScreenTime.prefPane',
  },
  {
    preferenceId: 'com.apple.preference.security',
    venturaPath: '/System/Library/PreferencePanes/Security.prefPane',
  },
  {
    preferenceId: 'com.apple.preference.sidecar',
    venturaPath: '/System/Library/PreferencePanes/Sidecar.prefPane', // does not work
  },
  {
    preferenceId: 'com.apple.preference.sound',
    venturaPath: '/System/Library/PreferencePanes/Sound.prefPane',
  },
  {
    preferenceId: 'com.apple.preference.speech',
    venturaPath: '/System/Library/PreferencePanes/Speech.prefPane',
  },
  {
    preferenceId: 'com.apple.preference.spotlight',
    venturaPath: '/System/Library/PreferencePanes/Spotlight.prefPane',
  },
  {
    name: 'Trackpad',
    preferenceId: 'com.apple.preference.trackpad',
    venturaPath: '/System/Library/PreferencePanes/Trackpad.prefPane',
  },
  {
    name: 'Universal Access',
    preferenceId: 'com.apple.preference.universalaccess',
    venturaPath: '/System/Library/PreferencePanes/UniversalAccess.prefPane',
  },
  {
    name: 'Apple ID',
    preferenceId: 'com.apple.preferences.AppleIDPrefPane',
    venturaPath: '/System/Library/PreferencePanes/AppleIDPrefPane.prefPane',
  },
  {
    name: 'Bluetooth',
    preferenceId: 'com.apple.preferences.Bluetooth',
    venturaPath: '/System/Library/PreferencePanes/Bluetooth.prefPane',
  },
  {
    name: 'Configuration Profiles',
    preferenceId: 'com.apple.preferences.configurationprofiles',
    venturaPath:
      '/System/Library/PreferencePanes/ConfigurationProfiles.prefPane',
  },
  {
    preferenceId: 'com.apple.preferences.extensions',
    venturaPath: '/System/Library/PreferencePanes/Extensions.prefPane',
  },
  {
    name: 'Family Sharing',
    preferenceId: 'com.apple.preferences.FamilySharingPrefPane',
    venturaPath: '/System/Library/PreferencePanes/FamilySharing.prefPane',
  },
  {preferenceId: 'com.apple.preferences.icloud'},
  {
    name: 'Internet Accounts',
    preferenceId: 'com.apple.preferences.internetaccounts',
    venturaPath: '/System/Library/PreferencePanes/InternetAccounts.prefPane',
  },
  {
    name: 'Parental Controls',
    preferenceId: 'com.apple.preferences.parentalcontrols',
    venturaPath: '/System/Library/PreferencePanes/ParentalControls.prefPane',
  },
  {
    preferenceId: 'com.apple.preferences.password',
    venturaPath: '/System/Library/PreferencePanes/Password.prefPane',
  },
  {
    preferenceId: 'com.apple.preferences.sharing',
    venturaPath: '/System/Library/PreferencePanes/SharingPrefPane.prefPane',
  },
  {
    name: 'Software Update',
    preferenceId: 'com.apple.preferences.softwareupdate',
    venturaPath: '/System/Library/PreferencePanes/SoftwareUpdate.prefPane',
  },
  {
    preferenceId: 'com.apple.preferences.users',
    venturaPath: '/System/Library/PreferencePanes/Accounts.prefPane',
  },
  {
    preferenceId: 'com.apple.preferences.wallet',
    venturaPath: '/System/Library/PreferencePanes/Wallet.prefPane',
  },
  {preferenceId: 'com.apple.prefs.backup'},
]

export function buildSystemPreferenceItem({
  preferenceId,
  icon,
  name,
  venturaPath,
}: {
  preferenceId: string
  icon?: string
  name?: string
  venturaPath?: string
}): Item {
  name = name || preferenceId.split('.').pop()!
  return {
    name: `${capitalize(name)} Preferences`,
    iconComponent: SystemPreferencesIcon,
    type: ItemType.CONFIGURATION,
    callback: () => {
      if (solNative.OSVersion >= 13) {
        if (venturaPath) {
          Linking.openURL(venturaPath)
        } else {
          Linking.openURL('/System/Library/PreferencePanes/General.prefPane')
        }
      } else {
        solNative.executeAppleScript(`tell application "System Preferences"
        activate
        set current pane to pane "${preferenceId}"
       end tell
       `)
      }
    },
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function buildSystemPreferencesItems() {
  return panes.map(buildSystemPreferenceItem)
}
