import React from 'react'
import {ViewStyle} from 'react-native'
import tw from 'tailwind'
import {FileIcon} from './FileIcon'

export const SystemPreferencesIcon = ({style}: {style?: ViewStyle} = {}) => {
  return (
    <FileIcon
      style={style || tw`w-4 h-4`}
      url="/System/Applications/System Preferences.app"
    />
  )
}
