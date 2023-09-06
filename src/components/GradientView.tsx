import {requireNativeComponent, ViewStyle} from 'react-native'
import {styled} from 'nativewind'

export const GradientView = styled(
  requireNativeComponent<{
    children?: any
    onLayout?: (e: any) => void
    style?: ViewStyle
    startColor: string
    endColor: string
    angle: number
    cornerRadius?: number
  }>('GradientView'),
)
