import {SystemPreferencesIcon} from 'components/SystemPreferencesIcon'
import {solNative} from 'lib/SolNative'
import {Linking} from 'react-native'
import {ItemType} from './ui.store'

const SYSTEM_PREFERENCE_PANES = '/System/Library/PreferencePanes'
const GLOBAL_PREFERENCE_PANES = '/Library/PreferencePanes'
const USER_PREFERENCE_PANES = `/Users/${solNative.userName()}/Library/PreferencePanes`

const systemPanes = solNative.ls(SYSTEM_PREFERENCE_PANES).map(pane => ({
  name: pane
    .replace('.prefPane', '')
    .split(/(?=[A-Z])/)
    .join(' '),
  preferenceId: `${SYSTEM_PREFERENCE_PANES}/${pane}`,
}))

const globalPanes = solNative.ls(GLOBAL_PREFERENCE_PANES).map(pane => ({
  name: pane
    .replace('.prefPane', '')
    .split(/(?=[A-Z])/)
    .join(' '),
  preferenceId: `${GLOBAL_PREFERENCE_PANES}/${pane}`,
}))

const userPanes = solNative.ls(USER_PREFERENCE_PANES).map(pane => ({
  name: pane
    .replace('.prefPane', '')
    .split(/(?=[A-Z])/)
    .join(' '),
  preferenceId: `${USER_PREFERENCE_PANES}/${pane}`,
}))

const panes = [...systemPanes, ...globalPanes, ...userPanes]

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
  return panes.map(buildSystemPreferenceItem)
}
