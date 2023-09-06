import {requireNativeComponent, ViewStyle} from 'react-native'
import {styled} from 'nativewind'

export const FileIcon = styled(
  requireNativeComponent<{
    url: string
    style?: ViewStyle
  }>('FileIcon'),
)
