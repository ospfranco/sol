import {solNative} from 'lib/SolNative'
import {ItemType} from './ui.store'

const preferences = [
  {name: 'Language & Region', preference: 'com.apple.Localization'},
  {name: 'Date & Time', preference: 'com.apple.preference.datetime'},
  {
    name: 'Desktop & ScreenSaver',
    preference: 'com.apple.preference.desktopscreeneffect',
  },
  // {preference: 'com.apple.preference.digihub.discs'},
  {
    // icon: '📺',
    name: 'Display',
    preference: 'com.apple.preference.displays',
  },
  {name: 'Dock & Menubar', preference: 'com.apple.preference.dock'},
  {name: 'Battery', preference: 'com.apple.preference.battery'},
  {name: 'Exposé', preference: 'com.apple.preference.expose'},
  {preference: 'com.apple.preference.general'},
  // {preference: 'com.apple.preference.ink'},
  {name: 'Keyboard', preference: 'com.apple.preference.keyboard'},
  {name: 'Mouse', preference: 'com.apple.preference.mouse'},
  {name: 'Network', preference: 'com.apple.preference.network'},
  {name: 'Notifications', preference: 'com.apple.preference.notifications'},
  // {preference: 'com.apple.preference.printfax'},
  {name: 'Screen Time', preference: 'com.apple.preference.screentime'},
  {preference: 'com.apple.preference.security'},
  {preference: 'com.apple.preference.sidecar'},
  {preference: 'com.apple.preference.sound'},
  {preference: 'com.apple.preference.speech'},
  {preference: 'com.apple.preference.spotlight'},
  // {preference: 'com.apple.preference.startupdisk'},
  {name: 'TrackPad', preference: 'com.apple.preference.trackpad'},
  {
    name: 'Universal Access',
    preference: 'com.apple.preference.universalaccess',
  },
  {name: 'Apple ID', preference: 'com.apple.preferences.AppleIDPrefPane'},
  {name: 'App Store', preference: 'com.apple.preferences.appstore'},
  {name: 'Bluetooth', preference: 'com.apple.preferences.Bluetooth'},
  {
    name: 'Configuration Profiles',
    preference: 'com.apple.preferences.configurationprofiles',
  },
  {preference: 'com.apple.preferences.extensions'},
  {
    name: 'Family Sharing',
    preference: 'com.apple.preferences.FamilySharingPrefPane',
  },
  {preference: 'com.apple.preferences.icloud'},
  {
    name: 'Internet Accounts',
    preference: 'com.apple.preferences.internetaccounts',
  },
  {
    name: 'Parental Controls',
    preference: 'com.apple.preferences.parentalcontrols',
  },
  {preference: 'com.apple.preferences.password'},
  {preference: 'com.apple.preferences.sharing'},
  {
    name: 'Software Updates',
    preference: 'com.apple.preferences.softwareupdate',
  },
  {preference: 'com.apple.preferences.users'},
  {preference: 'com.apple.preferences.wallet'},
  // {preference: 'com.apple.prefpanel.fibrechannel'},
  {preference: 'com.apple.prefs.backup'},
  // {preference: 'com.apple.Xsan'},
]

export function buildSystemPreferenceItem(
  item: {
    preference: string
    icon?: string
    name?: string
  },
  systemPreferencesUrl: string | undefined,
) {
  const name = item.name || item.preference.split('.').pop()!
  return {
    name: `${capitalize(name)} Preferences`,
    ...(systemPreferencesUrl
      ? {url: systemPreferencesUrl}
      : {icon: item.icon || '⚙️'}),
    type: ItemType.CONFIGURATION,
    command: 'systemPreferences:open',
    callback: () => {
      solNative.executeAppleScript(`tell application "System Preferences"
      activate
      set current pane to pane "${item.preference}"
     end tell
     `)
    },
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function buildSystemPreferencesItems(
  systemPreferencesUrl: string | undefined,
) {
  return preferences.map(x =>
    buildSystemPreferenceItem(x, systemPreferencesUrl),
  )
}
