import React, {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import tw from 'tailwind'

interface IProps {
  title: string
  primary?: boolean
  style?: ViewStyle
  brRounded?: boolean
}

export const Key: FC<IProps> = ({
  title,
  primary = false,
  style,
  brRounded = false,
}) => {
  return (
    <View
      style={tw.style(
        `py-1 px-2 min-w-5 rounded items-center justify-center`,
        {
          'dark:bg-gray-800 bg-neutral-200': !primary,
          'bg-accent': primary,
          'rounded-br-corner': brRounded,
        },
        style,
      )}>
      <Text
        style={tw.style(`text-xxs font-semibold`, {
          'dark:text-neutral-300 text-neutral-500': !primary,
          'text-white': primary,
        })}>
        {title.trim()}
      </Text>
    </View>
  )
}
