import {solNative} from 'lib/SolNative'
import {ItemType} from './ui.store'

const preferences = [
  {preference: 'com.apple.Localization'},
  {preference: 'com.apple.preference.datetime'},
  {preference: 'com.apple.preference.desktopscreeneffect'},
  {preference: 'com.apple.preference.digihub.discs'},
  {
    icon: '📺',
    preference: 'com.apple.preference.displays',
  },
  {preference: 'com.apple.preference.dock'},
  {preference: 'com.apple.preference.energysaver'},
  {preference: 'com.apple.preference.expose'},
  {preference: 'com.apple.preference.general'},
  {preference: 'com.apple.preference.ink'},
  {preference: 'com.apple.preference.keyboard'},
  {preference: 'com.apple.preference.mouse'},
  {preference: 'com.apple.preference.network'},
  {preference: 'com.apple.preference.notifications'},
  {preference: 'com.apple.preference.printfax'},
  {preference: 'com.apple.preference.screentime'},
  {preference: 'com.apple.preference.security'},
  {preference: 'com.apple.preference.sidecar'},
  {preference: 'com.apple.preference.sound'},
  {preference: 'com.apple.preference.speech'},
  {preference: 'com.apple.preference.spotlight'},
  {preference: 'com.apple.preference.startupdisk'},
  {preference: 'com.apple.preference.trackpad'},
  {preference: 'com.apple.preference.universalaccess'},
  {preference: 'com.apple.preferences.AppleIDPrefPane'},
  {preference: 'com.apple.preferences.appstore'},
  {preference: 'com.apple.preferences.Bluetooth'},
  {preference: 'com.apple.preferences.configurationprofiles'},
  {preference: 'com.apple.preferences.extensions'},
  {preference: 'com.apple.preferences.FamilySharingPrefPane'},
  {preference: 'com.apple.preferences.icloud'},
  {preference: 'com.apple.preferences.internetaccounts'},
  {preference: 'com.apple.preferences.parentalcontrols'},
  {preference: 'com.apple.preferences.password'},
  {preference: 'com.apple.preferences.sharing'},
  {preference: 'com.apple.preferences.softwareupdate'},
  {preference: 'com.apple.preferences.users'},
  {preference: 'com.apple.preferences.wallet'},
  {preference: 'com.apple.prefpanel.fibrechannel'},
  {preference: 'com.apple.prefs.backup'},
  {preference: 'com.apple.Xsan'},
]

export function buildSystemPreferenceItem(item: {
  preference: string
  icon?: string
  name?: string
}) {
  const name = item.name || item.preference.split('.').pop()!
  return {
    name: `${capitalize(name)} Preference`,
    icon: item.icon || '⚙️',
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

export function buildSystemPreferencesItems() {
  return preferences.map(buildSystemPreferenceItem)
}
