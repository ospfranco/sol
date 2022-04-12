import {requireNativeComponent, ViewStyle} from 'react-native'

export const FileIcon = requireNativeComponent<{url: string; style: ViewStyle}>(
  'FileIcon',
)
