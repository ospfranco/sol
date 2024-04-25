import {requireNativeComponent, ViewStyle} from 'react-native'

import {cssInterop} from 'nativewind'

export const BlurViewNative = requireNativeComponent<{
  children?: any
  onLayout?: (e: any) => void
  style?: ViewStyle
  cornerRadius?: number
  disabled?: boolean
  className?: string
}>('BlurView')

export const BlurView = (props: any) => {
  return <BlurViewNative {...props} />
}

cssInterop(BlurView, {
  className: 'style',
})
