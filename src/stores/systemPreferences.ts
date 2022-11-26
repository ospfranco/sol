import {SystemPreferencesIcon} from 'components/SystemPreferencesIcon'
import {solNative} from 'lib/SolNative'
import {Linking} from 'react-native'
import {ItemType} from './ui.store'

const systemPanes = solNative
  .ls('/System/Library/PreferencePanes')
  .map(pane => ({
    name: pane
      .replace('.prefPane', '')
      .split(/(?=[A-Z])/)
      .join(' '),
    preferenceId: `/System/Library/PreferencePanes/${pane}`,
  }))

const globalPanes = solNative.ls('/Library/PreferencePanes').map(pane => ({
  name: pane
    .replace('.prefPane', '')
    .split(/(?=[A-Z])/)
    .join(' '),
  preferenceId: `/Library/PreferencePanes/${pane}`,
}))

const userPanes = solNative
  .ls(`/Users/${solNative.userName()}/Library/PreferencePanes`)
  .map(pane => ({
    name: pane
      .replace('.prefPane', '')
      .split(/(?=[A-Z])/)
      .join(' '),
    preferenceId: `/Library/PreferencePanes/${pane}`,
  }))

const venturaPanes = [...systemPanes, ...globalPanes, ...userPanes]

const panes = [
  {
    name: 'Language & Region',
    preferenceId: 'com.apple.Localization',
  },
  {
    name: 'Date & Time',
    preferenceId: 'com.apple.preference.datetime',
  },
  {
    name: 'Desktop & ScreenSaver',
    preferenceId: 'com.apple.preference.desktopscreeneffect',
  },
  {
    name: 'Display',
    preferenceId: 'com.apple.preference.displays',
  },
  {
    name: 'Dock & Menubar',
    preferenceId: 'com.apple.preference.dock',
  },
  {
    name: 'Battery',
    preferenceId: 'com.apple.preference.battery',
  },
  {
    name: 'Exposé',
    preferenceId: 'com.apple.preference.expose',
  },
  {
    name: 'General',
    preferenceId: 'com.apple.preference.general',
  },
  {
    name: 'Keyboard',
    preferenceId: 'com.apple.preference.keyboard',
  },
  {
    name: 'Mouse',
    preferenceId: 'com.apple.preference.mouse',
  },
  {
    name: 'Network',
    preferenceId: 'com.apple.preference.network',
  },
  {
    name: 'Notifications',
    preferenceId: 'com.apple.preference.notifications',
  },
  {
    name: 'Printers & Scanners',
    preferenceId: 'com.apple.preference.printfax',
  },
  {
    name: 'Screen Time',
    preferenceId: 'com.apple.preference.screentime',
  },
  {
    preferenceId: 'com.apple.preference.security',
  },
  {
    preferenceId: 'com.apple.preference.sidecar',
  },
  {
    preferenceId: 'com.apple.preference.sound',
  },
  {
    preferenceId: 'com.apple.preference.speech',
  },
  {
    preferenceId: 'com.apple.preference.spotlight',
  },
  {
    name: 'Trackpad',
    preferenceId: 'com.apple.preference.trackpad',
  },
  {
    name: 'Universal Access',
    preferenceId: 'com.apple.preference.universalaccess',
  },
  {
    name: 'Apple ID',
    preferenceId: 'com.apple.preferences.AppleIDPrefPane',
  },
  {
    name: 'Bluetooth',
    preferenceId: 'com.apple.preferences.Bluetooth',
  },
  {
    name: 'Configuration Profiles',
    preferenceId: 'com.apple.preferences.configurationprofiles',
  },
  {
    preferenceId: 'com.apple.preferences.extensions',
  },
  {
    name: 'Family Sharing',
    preferenceId: 'com.apple.preferences.FamilySharingPrefPane',
  },
  {preferenceId: 'com.apple.preferences.icloud'},
  {
    name: 'Internet Accounts',
    preferenceId: 'com.apple.preferences.internetaccounts',
  },
  {
    name: 'Parental Controls',
    preferenceId: 'com.apple.preferences.parentalcontrols',
  },
  {
    preferenceId: 'com.apple.preferences.password',
  },
  {
    preferenceId: 'com.apple.preferences.sharing',
  },
  {
    name: 'Software Update',
    preferenceId: 'com.apple.preferences.softwareupdate',
  },
  {
    preferenceId: 'com.apple.preferences.users',
  },
  {
    preferenceId: 'com.apple.preferences.wallet',
  },
  {preferenceId: 'com.apple.prefs.backup'},
]

export function buildSystemPreferenceItem({
  preferenceId,
  icon,
  name,
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
        Linking.openURL(preferenceId)
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
  if (solNative.OSVersion >= 13) {
    return venturaPanes.map(buildSystemPreferenceItem)
  } else {
    return panes.map(buildSystemPreferenceItem)
  }
}
