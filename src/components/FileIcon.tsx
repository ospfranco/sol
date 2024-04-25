import {cssInterop} from 'nativewind'
import {requireNativeComponent, ViewStyle} from 'react-native'

const FileIconNative = requireNativeComponent<{
  url: string
  style?: ViewStyle
  className?: string
}>('FileIcon')

export const FileIcon = (props: any) => {
  return <FileIconNative {...props} />
}

cssInterop(FileIcon, {
  className: 'style',
})
