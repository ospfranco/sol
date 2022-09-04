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
      style={tw.style(
        'rounded px-2 py-1 w-full',
        {
          'bg-accent dark:bg-opacity-40 bg-opacity-80': selected,
          'bg-accent dark:bg-opacity-20 bg-opacity-60': !selected && hovered,
        },
        style,
      )}>
      <Text
        style={tw.style(`pl-1`, {
          'text-white': selected || hovered,
        })}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}
