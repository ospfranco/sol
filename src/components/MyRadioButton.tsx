import clsx from 'clsx'
import React, {FC} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

interface Props {
  label: string
  value: any
  onValueChange: (v: boolean) => void
  disabled?: boolean
  selected: boolean
}

export const MyRadioButton: FC<Props> = ({
  label,
  value,
  onValueChange,
  selected,
}) => {
  return (
    <TouchableOpacity
      className="flex-row items-center pb-2"
      onPress={() => onValueChange(value)}>
      <View
        className={clsx(
          'w-4 h-4 mr-2 rounded-full bg-neutral-300 dark:bg-neutral-700 p-0.5 items-center justify-center',
          {
            'bg-blue-500': selected,
          },
        )}>
        {selected && <View className="rounded-full bg-white w-[6px] h-[6px]" />}
      </View>
      <Text>{label}</Text>
    </TouchableOpacity>
  )
}
