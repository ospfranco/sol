import React, {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import tw from 'tailwind'

interface IProps {
  title: string
  primary?: boolean
  style?: ViewStyle
  brRounded?: boolean
}

export const Key: FC<IProps> = ({title, primary = false, style}) => {
  return (
    <View
      style={tw.style(
        `px-1 min-w-5 h-5 rounded items-center justify-center border`,
        {
          'dark:bg-proGray-900 bg-neutral-200 dark:border-neutral-700 border-neutral-300':
            !primary,
          'bg-accent': primary,
        },
        style,
      )}>
      <Text
        style={tw.style({
          'dark:text-neutral-300 text-neutral-600': !primary,
          'text-white': primary,
          fontSize: 10,
          textAlign: 'center',
        })}>
        {title.trim()}
      </Text>
    </View>
  )
}
