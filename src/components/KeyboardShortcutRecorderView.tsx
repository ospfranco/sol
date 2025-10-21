import { requireNativeComponent } from 'react-native'
import { FC } from 'react'
import { cssInterop } from 'nativewind'

type Props = {
  onShortcutChange: (e: any) => void
  onCancel: () => void
  style?: any
  className?: string
}

export const KeyboardShortcutRecorderViewNative = requireNativeComponent<Props>(
  'KeyboardShortcutRecorderView',
)

export const KeyboardShortcutRecorderView: FC<Props> = props => {
  return <KeyboardShortcutRecorderViewNative {...props} />
}

cssInterop(KeyboardShortcutRecorderView, {
  className: 'style',
})
