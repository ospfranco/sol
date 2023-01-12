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
        'p-2 w-full border-l-2 border-transparent',
        {
          'bg-lightHighlight dark:bg-darkHighlight border-neutral-800 dark:border-white':
            selected,
          'bg-gray-200 dark:bg-darkBorder': !selected && hovered,
        },
        style,
      )}>
      <Text
        style={tw.style(`pl-1 text-sm text-neutral-600 dark:text-white`, {
          'text-black dark:text-white': selected || hovered,
        })}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}
