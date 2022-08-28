import React, {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import tw from 'tailwind'

export const Key: FC<{title: string; primary?: boolean; style?: ViewStyle}> = ({
  title,
  primary = false,
  style,
}) => {
  return (
    <View
      style={tw.style(
        `py-1 px-2 min-w-5 rounded items-center justify-center`,
        {
          'dark:bg-neutral-700 bg-neutral-200': !primary,
          'bg-accent': primary,
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
