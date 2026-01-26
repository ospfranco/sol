import {cssInterop} from 'nativewind'
import {requireNativeComponent, ViewStyle} from 'react-native'

const ImagePreviewNative = requireNativeComponent<{
  path: string
  style?: ViewStyle
  className?: string
}>('ImagePreview')

export const ImagePreview = (props: any) => {
  return <ImagePreviewNative {...props} />
}

cssInterop(ImagePreview, {
  className: 'style',
})
