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
        className={clsx('p-2 flex-row items-center gap-1 rounded', className, {
          'rounded-full': rounded,
          highlight: selected,
          'bg-neutral-400 dark:bg-neutral-700': hovered,
        })}>
        {leftItem}
        {!!title && (
          <Text
            className={clsx(`text-sm text`, {
              'text-blue-500 dark:text-blue-500': selected,
            })}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}
