import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
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
  ...props
}) => {
  const [hovered, hoverOn, hoverOff] = useBoolean()
  return (
    <TouchableOpacity
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      {...props}
      // @ts-ignore
      enableFocusRing={false}
      className={clsx('p-2 flex-row items-center g-1 rounded', {
        'rounded-full': rounded,
      })}
      style={[
        {
          backgroundColor: selected
            ? colors.accentBg
            : hovered
            ? colors.accentBg
            : undefined,
        },
        style,
      ]}>
      {leftItem}
      {!!title && (
        <Text
          className={clsx(`text-sm text-neutral-600 dark:text-white`, {
            'text-white': selected || hovered,
          })}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}
