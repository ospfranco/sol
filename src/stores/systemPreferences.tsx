import {solNative} from 'lib/SolNative'
import {Image, ImageSourcePropType, Linking} from 'react-native'
import {ItemType} from './ui.store'
import {FileIcon} from 'components/FileIcon'
import plist from '@expo/plist'
import {Icons} from 'assets'

const ignoreList = [
  'ClassKitPreferencePane.prefPane',
  'ClassroomSettings.prefPane',
  'DesktopScreenEffectsPref.prefPane',
  'DigiHubDiscs.prefPane',
  'EnergySaver.prefPane',
  'EnergySaverPref.prefPane',
  'Expose.prefPane',
  'PrintAndFax.prefPane',
]

const nameMappings: Record<string, string> = {
  'Accounts.prefPane': 'Users & Groups',
  'AppleIDPrefPane.prefPane': 'Apple ID',
  'DateAndTime.prefPane': 'Date & Time',
  'DesktopScreenEffectsPref.prefPane': 'Desktop & Screen Saver',
  'FamilySharingPrefPane.prefPane': 'Family',
  'PrintAndScan.prefPane': 'Printers & Scanners',
  'PrivacyAndSecurity.prefPane': 'Privacy & Security',
  'SharingPref.prefPane': 'Sharing',
  'TouchID.prefPane': 'Touch ID',
  'UniversalAccessPref.prefPane': 'Accessibility',
}

const iconMap: Record<string, ImageSourcePropType> = {
  'Bluetooth.prefPane': Icons.Bluetooth,
}

const SYSTEM_PREFERENCE_PANES = '/System/Library/PreferencePanes'
const GLOBAL_PREFERENCE_PANES = '/Library/PreferencePanes'
const USER_PREFERENCE_PANES = `/Users/${solNative.userName()}/Library/PreferencePanes`

function extractObjectFromPrefPanePath(path: string, fileName: string) {
  if (ignoreList.includes(fileName)) {
    return null
  }

  let plistFileExists = solNative.exists(`${path}/Contents/Info.plist`)

  if (plistFileExists) {
    let plistContent = solNative.readFile(path)

    let parsed = plist.parse(plistContent)

    return {
      name: parsed.CFBundleDisplayName,
      preferenceId: path,
      icon: iconMap[fileName],
    }
  } else {
    // We don't have a plist file, so we'll just use the filename (with mapping)
    let name = nameMappings[fileName]

    if (!name) {
      const tokens = fileName.split('/')
      name = tokens[tokens.length - 1]
        .replace('.prefPane', '')
        .split(/(?=[A-Z])/)
        .join(' ')
    }
    return {
      name,
      preferenceId: `${path}/${fileName}`,
      icon: iconMap[fileName],
    }
  }
}

const systemPanes = solNative.exists(SYSTEM_PREFERENCE_PANES)
  ? solNative
      .ls(SYSTEM_PREFERENCE_PANES)
      .map(pane => extractObjectFromPrefPanePath(SYSTEM_PREFERENCE_PANES, pane))
  : []

const globalPanes = solNative.exists(GLOBAL_PREFERENCE_PANES)
  ? solNative
      .ls(GLOBAL_PREFERENCE_PANES)
      .map(pane => extractObjectFromPrefPanePath(GLOBAL_PREFERENCE_PANES, pane))
  : []

const userPanes = solNative.exists(USER_PREFERENCE_PANES)
  ? solNative
      .ls(USER_PREFERENCE_PANES)
      .map(pane => extractObjectFromPrefPanePath(USER_PREFERENCE_PANES, pane))
  : []

const panes: {name: string; preferenceId: string}[] = [
  ...systemPanes,
  ...globalPanes,
  ...userPanes,
].filter(a => a) as any

export function buildSystemPreferenceItem({
  preferenceId,
  name,
  icon,
}: {
  preferenceId: string
  name?: string
  icon?: ImageSourcePropType
}): Item {
  name = name || preferenceId.split('.').pop()!

  return {
    name: name,
    IconComponent: (props: any[]) => {
      if (icon != null) {
        return <Image source={icon} className="w-5 h-5" {...props} />
      } else {
        return (
          <FileIcon
            className="w-5 h-5"
            url={
              solNative.OSVersion >= 13
                ? '/System/Applications/System Settings.app'
                : '/System/Applications/System Preferences.app'
            }
            {...props}
          />
        )
      }
    },
    type: ItemType.PREFERENCE_PANE,
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

export const systemPreferenceItems = panes.map(buildSystemPreferenceItem)
