import {cssInterop} from 'nativewind'
import {requireNativeComponent, ViewStyle} from 'react-native'

const GradientViewNative = requireNativeComponent<{
  children?: any
  onLayout?: (e: any) => void
  style?: ViewStyle
  startColor: string
  endColor: string
  angle: number
  className?: string
  cornerRadius?: number
}>('GradientView')

export const GradientView = (props: any) => {
  return <GradientViewNative {...props} />
}

cssInterop(GradientView, {
  className: 'style',
})
