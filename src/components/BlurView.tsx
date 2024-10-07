import {requireNativeComponent, ViewStyle} from 'react-native'

import {cssInterop} from 'nativewind'
import {FC} from 'react'

type BlurViewProps = {
  children?: any
  onLayout?: (e: any) => void
  style?: ViewStyle
  borderRadius?: number
  disabled?: boolean
  materialName?:
    | 'windowBackground'
    | 'menu'
    | 'sidebar'
    | 'header'
    | 'sheet'
    | 'popover'
    | 'hudWindow'
    | 'fullScreenUI'
  className?: string
}

export const BlurViewNative = requireNativeComponent<BlurViewProps>('BlurView')

export const BlurView: FC<BlurViewProps> = props => {
  return (
    <BlurViewNative
      {...props}
      materialName={props.materialName ?? 'windowBackground'}
    />
  )
}

cssInterop(BlurView, {
  className: 'style',
  nativeStyleToProp: {
    // @ts-expect-error
    borderRadius: 'borderRadius',
  },
})
