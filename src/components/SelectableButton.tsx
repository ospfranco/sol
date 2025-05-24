import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {
  ImageSourcePropType,
  Text,
  TouchableOpacityProps,
  View,
  ViewStyle,
  Image,
  TouchableWithoutFeedback,
} from 'react-native'

interface SelectableButtonProps extends TouchableOpacityProps {
  selected: boolean
  title?: string
  style?: ViewStyle
  className?: string
  leftItem?: React.ReactNode
  rounded?: boolean
  icon?: ImageSourcePropType
}

export const SelectableButton: FC<SelectableButtonProps> = ({
  selected,
  title,
  style,
  leftItem,
  rounded,
  className,
  icon,
  ...props
}) => {
  const [hovered, hoverOn, hoverOff] = useBoolean()
  return (
    <TouchableWithoutFeedback
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      {...props}
      // @ts-expect-error
      enableFocusRing={false}>
      <View
        className={clsx(
          'px-1.5 py-1 flex-row items-center gap-1.5 rounded',
          className,
          {
            'rounded-full': rounded,
            'bg-accent-strong': selected,
            'bg-accent': hovered,
          },
        )}>
        {!!icon && <Image source={icon} className="w-6 h-6" />}
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
    </TouchableWithoutFeedback>
  )
}
