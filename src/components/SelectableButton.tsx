import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'
import colors from '../colors'

interface SelectableButtonProps extends TouchableOpacityProps {
  selected: boolean
  title?: string
  style?: ViewStyle
  className?: string
  leftItem?: React.ReactNode
  rounded?: boolean
}

export const SelectableButton: FC<SelectableButtonProps> = ({
  selected,
  title,
  style,
  leftItem,
  rounded,
  className,
  ...props
}) => {
  const [hovered, hoverOn, hoverOff] = useBoolean()
  return (
    <TouchableOpacity
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      {...props}
      // @ts-expect-error
      enableFocusRing={false}>
      <View
        className={clsx(
          'px-2 py-1.5 flex-row items-center gap-1 rounded',
          className,
          {
            'rounded-full': rounded,
            'bg-accent-strong': selected,
            'bg-accent': hovered,
          },
        )}>
        {leftItem}
        {!!title && (
          <Text
            className={clsx(`text-sm`, {
              'text-white': selected,
            })}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}
