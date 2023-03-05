import {solNative} from 'lib/SolNative'
import React from 'react'
import {ViewStyle} from 'react-native'
import {FileIcon} from './FileIcon'

export const SystemPreferencesIcon = ({style}: {style?: ViewStyle} = {}) => {
  return (
    <FileIcon
      style={style}
      className="w-5 h-5"
      url={
        solNative.OSVersion >= 13
          ? '/System/Applications/System Settings.app'
          : '/System/Applications/System Preferences.app'
      }
    />
  )
}
