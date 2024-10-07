import {cssInterop} from 'nativewind'
import {requireNativeComponent, ViewStyle} from 'react-native'

type GradientProps = {
  children?: any
  onLayout?: (e: any) => void
  style?: ViewStyle
  startColor: string
  endColor: string
  angle: number
  className?: string
  cornerRadius?: number
}

const GradientViewNative = requireNativeComponent<GradientProps>('GradientView')

export const GradientView = (props: GradientProps) => {
  return <GradientViewNative {...props} />
}

cssInterop(GradientView, {
  className: 'style',
})
