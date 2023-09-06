import {requireNativeComponent, ViewStyle} from 'react-native'
import {styled} from 'nativewind'

export const BlurView = styled(
  requireNativeComponent<{
    children?: any
    onLayout?: (e: any) => void
    startColor: string
    endColor: string
    style?: ViewStyle
    cornerRadius?: number
    disabled?: boolean
  }>('BlurView'),
)
