import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native'
import tw from 'tailwind'

interface SelectableButtonProps extends TouchableOpacityProps {
  selected: boolean
  title: string
  style?: ViewStyle
}

export const SelectableButton: FC<SelectableButtonProps> = ({
  selected,
  title,
  style,
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
      className={clsx(
        'px-2 py-1 w-full border-l-2 border-transparent',
        {
          'bg-gray-200 dark:bg-darkHighlight dark:border-white': selected,
          'bg-gray-200 dark:bg-darkBorder': !selected && hovered,
        },
        style,
      )}>
      <Text
        style={tw.style(`pl-1 text-sm`, {
          'text-white': selected || hovered,
        })}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}
